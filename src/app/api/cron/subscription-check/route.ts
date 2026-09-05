import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkSubscriptionViaCreator } from "@/lib/youtube";
import { decryptToken } from "@/lib/crypto";
import { creditCoins, debitCoins } from "@/lib/coins";
import { handleError, HttpError } from "@/lib/api";

const RE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MAX_QUICK_CHECKS = 12;
const MAX_COINS_PER_RUN = 200;

export async function GET(req: NextRequest) {
  try {
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

  const due = await prisma.taskCompletion.findMany({
    where: {
      state: "VERIFIED",
      nextCheckAt: { lte: now },
      targetChannelId: { not: null },
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
    take: 50,
  });

  for (const completion of due) {
    if (processed >= MAX_COINS_PER_RUN) break;
    processed++;

    try {
      const ytChannel = completion.user.youtubeChannel;
      if (!ytChannel || !ytChannel.accessTokenCipher) {
        await revokeCompletion(completion.id, "Channel disconnected", completion.rewardCoins);
        revoked++;
        coinsReversed += completion.rewardCoins;
        continue;
      }

      const channel = await prisma.youTubeChannel.findUnique({ where: { id: ytChannel.id } });
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

      const creatorChannel = await prisma.youTubeChannel.findUnique({
        where: { userId: completion.campaign.ownerId },
        select: { accessTokenCipher: true, refreshTokenCipher: true },
      });
      if (!creatorChannel?.accessTokenCipher) {
        await revokeCompletion(completion.id, "Creator OAuth missing", completion.rewardCoins);
        revoked++;
        coinsReversed += completion.rewardCoins;
        continue;
      }

      const accessToken = decryptToken(creatorChannel.accessTokenCipher);
      const refreshToken = creatorChannel.refreshTokenCipher ? decryptToken(creatorChannel.refreshTokenCipher) : null;
      const verify = await checkSubscriptionViaCreator(accessToken, refreshToken, completion.userId, completion.targetChannelId!);

      if (!verify.verified) {
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

      const nextInterval = completion.checkCount < MAX_QUICK_CHECKS
        ? RE_CHECK_INTERVAL_MS
        : 24 * 60 * 60 * 1000;

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

    await tx.taskCompletion.update({
      where: { id: completionId },
      data: {
        state: "REVOKED",
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

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

    if (c.campaign) {
      await tx.campaign.update({
        where: { id: c.campaignId },
        data: {
          spentBudget: { decrement: refundCoins },
          completedActions: { decrement: 1 },
        },
      });
    }

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
