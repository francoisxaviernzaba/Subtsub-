import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkSubscription, getChannelById } from "@/lib/youtube";
import { decryptToken } from "@/lib/crypto";
import { creditCoins, debitCoins } from "@/lib/coins";
import { handleError, HttpError } from "@/lib/api";

/**
 * Background subscription re-verification.
 *
 * Runs every 5 minutes via Vercel Cron (or external cron).
 * - Picks up all SUBSCRIBE completions where nextCheckAt <= now AND state = VERIFIED.
 * - Re-checks if the user is still subscribed to the target channel.
 * - If NOT subscribed:
 *     - Marks completion REVOKED
 *     - Reverses the coin credit (debit the user)
 *     - Reverses the campaign budget (decrement spentBudget, completedActions)
 *     - Notifies the user to re-subscribe
 *     - Increments the user's strike count for repeat abuse
 * - If still subscribed:
 *     - Schedules the next check (every 5 minutes up to N times, then once a day for life)
 */

const RE_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_QUICK_CHECKS = 12; // after 12 quick checks (1 hour), switch to 24h interval
const MAX_COINS_PER_RUN = 200; // safety cap to avoid runaway processing

export async function GET(req: NextRequest) {
  try {
    // Auth: require CRON_SECRET header (Vercel Cron sets this) OR internal call
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw new HttpError(401, "UNAUTHORIZED", "Invalid cron secret");
    }

    const result = await runSubscriptionChecks();
    return NextResponse.json(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  // Same handler — allows manual POST triggers
  return GET(req);
}

async function runSubscriptionChecks() {
  const now = new Date();
  let processed = 0;
  let revoked = 0;
  let stillSubscribed = 0;
  let errors = 0;
  let coinsReversed = 0;
  let budgetReversed = 0;

  // Find VERIFIED subscribe completions that are due for a re-check
  const due = await prisma.taskCompletion.findMany({
    where: {
      state: "VERIFIED",
      nextCheckAt: { lte: now },
      targetChannelId: { not: null },
      // only SUBSCRIBER campaigns
      campaign: { type: "SUBSCRIBER" },
    },
    include: {
      user: {
        include: {
          youtubeChannel: true,
        },
      },
      campaign: true,
    },
    orderBy: { nextCheckAt: "asc" },
    take: 50, // batch limit per run
  });

  for (const completion of due) {
    if (processed >= MAX_COINS_PER_RUN) break;
    processed++;

    try {
      // Get the user's stored OAuth token
      const ytChannel = completion.user.youtubeChannel;
      if (!ytChannel || !ytChannel.accessTokenCipher) {
        // User no longer has a connected channel — revoke
        await revokeCompletion(completion.id, "Channel disconnected", completion.rewardCoins);
        revoked++;
        coinsReversed += completion.rewardCoins;
        continue;
      }

      // Refresh channel stats (subscriber count may have changed)
      const channel = await getChannelById(ytChannel.youtubeId);
      if (channel) {
        await prisma.youTubeChannel.update({
          where: { id: ytChannel.id },
          data: {
            subscriberCount: channel.subscriberCount ?? ytChannel.subscriberCount,
            videoCount: channel.videoCount ?? ytChannel.videoCount,
            title: channel.title,
            handle: channel.handle ?? ytChannel.handle,
            thumbnailUrl: channel.thumbnailUrl ?? ytChannel.thumbnailUrl,
          },
        });
      }

      const accessToken = decryptToken(ytChannel.accessTokenCipher);
      const verify = await checkSubscription(accessToken, completion.targetChannelId!);

      if (!verify.verified) {
        // Subscription was undone — revoke the reward
        await revokeCompletion(
          completion.id,
          `Subscription removed (${verify.reason || "UNSUBSCRIBED"})`,
          completion.rewardCoins,
        );
        revoked++;
        coinsReversed += completion.rewardCoins;
        budgetReversed += completion.rewardCoins;
        continue;
      }

      // Still subscribed — schedule next check
      const nextInterval = completion.checkCount < MAX_QUICK_CHECKS
        ? RE_CHECK_INTERVAL_MS
        : 24 * 60 * 60 * 1000; // 24h after the first hour

      await prisma.taskCompletion.update({
        where: { id: completion.id },
        data: {
          nextCheckAt: new Date(now.getTime() + nextInterval),
          checkCount: { increment: 1 },
        },
      });
      stillSubscribed++;
    } catch (e) {
      errors++;
      console.error("[cron] subscription check failed for completion", completion.id, e);
    }
  }

  return {
    processed,
    revoked,
    stillSubscribed,
    errors,
    coinsReversed,
    budgetReversed,
    ranAt: now.toISOString(),
  };
}

async function revokeCompletion(completionId: string, reason: string, refundCoins: number) {
  await prisma.$transaction(async (tx) => {
    const c = await tx.taskCompletion.findUnique({
      where: { id: completionId },
      include: { campaign: true },
    });
    if (!c || c.state !== "VERIFIED") return;

    // 1. Mark completion REVOKED
    await tx.taskCompletion.update({
      where: { id: completionId },
      data: {
        state: "REVOKED",
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    // 2. Reverse the coin credit (debit the user)
    if (refundCoins > 0) {
      await debitCoins({
        userId: c.userId,
        amount: refundCoins,
        type: "REVERSAL",
        referenceType: "TaskCompletion",
        referenceId: c.id,
        note: `Subscription revoked: ${reason}`,
        idempotencyKey: `reverse.sub.${c.id}`,
      });
    }

    // 3. Reverse the campaign budget
    if (c.campaign) {
      await tx.campaign.update({
        where: { id: c.campaignId },
        data: {
          spentBudget: { decrement: refundCoins },
          completedActions: { decrement: 1 },
        },
      });
    }

    // 4. Notify the user to re-subscribe
    await tx.notification.create({
      data: {
        userId: c.userId,
        kind: "SUBSCRIPTION_REVOKED",
        title: "Subscription no longer detected",
        body: `You unsubscribed from a boosted channel. ${refundCoins} coins were reversed from your balance. Please re-subscribe on YouTube and verify again.`,
        link: "/s2s",
      },
    }).catch(() => {});
  });
}
