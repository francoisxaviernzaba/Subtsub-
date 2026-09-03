import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError, withIdempotency } from "@/lib/api";
import { rateLimit, getClientKey } from "@/lib/ratelimit";
import { checkSubscription } from "@/lib/youtube";
import { decryptToken } from "@/lib/crypto";
import { creditCoins } from "@/lib/coins";
import { getSettings } from "@/lib/settings";
import { addXp, updateDailyStreak, incrementDailyQuest } from "@/lib/gamification";

const Body = z.object({
  campaignId: z.string().min(1),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (!rateLimit(getClientKey(req, u.user.id), 10, 0.5)) throw new HttpError(429, "RATE_LIMIT", "Slow down");
    const body = await req.json().catch(() => null);
    const parsed = Body.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "VALIDATION", parsed.error.message);
    const { campaignId, idempotencyKey } = parsed.data;

    return await withIdempotency(u.user.id, "subscribe.claim", idempotencyKey ?? null, async () => {
      const result = await prisma.$transaction(async (tx) => {
        const campaign = await tx.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
        if (campaign.type !== "SUBSCRIBER") throw new HttpError(400, "WRONG_TYPE", "Not a subscriber campaign");
        if (campaign.status !== "ACTIVE") throw new HttpError(400, "INACTIVE", "Campaign is not active");
        if (campaign.ownerId === u!.user.id) throw new HttpError(400, "SELF", "Cannot subscribe to your own channel");
        if (!campaign.youtubeChannelId) throw new HttpError(400, "NO_TARGET", "Campaign has no target channel");
        if (campaign.spentBudget >= campaign.totalBudget) throw new HttpError(400, "EXHAUSTED", "Campaign budget exhausted");
        if (campaign.completedActions >= campaign.maxActions) throw new HttpError(400, "FULL", "Campaign is full");

        // dedupe: (user, targetChannel)
        const existing = await tx.taskCompletion.findFirst({
          where: { userId: u!.user.id, targetChannelId: campaign.youtubeChannelId },
        });
        if (existing) {
          if (existing.state === "VERIFIED") throw new HttpError(409, "DUPLICATE", "You already subscribed to this channel");
          if (existing.state === "PENDING") throw new HttpError(409, "PENDING", "Verification already in progress");
        }

        // require YT connection
        const myChannel = await tx.youTubeChannel.findUnique({ where: { userId: u!.user.id } });
        if (!myChannel) throw new HttpError(400, "NO_YT", "Connect your YouTube channel first");
        if (!myChannel.accessTokenCipher) throw new HttpError(400, "NO_SCOPE", "Subscribe tasks require Google OAuth. Connect via OAuth at /settings#youtube (Google sign-in) to enable subscription verification.");

        // Atomic: reserve budget + create PENDING completion
        const settings = await getSettings();
        const reward = Math.min(campaign.rewardPerAction, settings.maxRewardPerAction);

        // Create PENDING record first with next check scheduled
        const completion = await tx.taskCompletion.create({
          data: {
            userId: u!.user.id,
            campaignId: campaign.id,
            targetChannelId: campaign.youtubeChannelId,
            state: "PENDING",
            rewardCoins: reward,
            // Schedule first re-verification 5 minutes from now
            nextCheckAt: new Date(Date.now() + 5 * 60 * 1000),
            idempotencyKey: idempotencyKey ?? null,
          },
        });

        return { campaign, completion, accessToken: decryptToken(myChannel.accessTokenCipher) };
      });

      // Now verify with YouTube (outside tx to avoid holding connection)
      const verify = await checkSubscription(result.accessToken, result.campaign.youtubeChannelId!);

      if (!verify.verified) {
        await prisma.taskCompletion.update({
          where: { id: result.completion.id },
          data: { state: "FAILED" },
        });
        const msg =
          verify.reason === "NOT_SUBSCRIBED" ? "We could not detect your subscription. Please subscribe on YouTube first." :
          verify.reason === "NO_SCOPE" ? "Reconnect your YouTube channel to grant permission to verify subscriptions." :
          "Verification unavailable. Please try again later.";
        throw new HttpError(400, verify.reason || "UNVERIFIED", msg);
      }

      // Credit coins + mark verified + reserve budget (all atomic)
      const settings = await getSettings();
      const reward = Math.min(result.campaign.rewardPerAction, settings.maxRewardPerAction);

      const finalState = await prisma.$transaction(async (tx) => {
        // Re-check campaign budget under tx
        const c = await tx.campaign.findUnique({ where: { id: result.campaign.id } });
        if (!c) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
        if (c.spentBudget + reward > c.totalBudget) {
          // mark completion FAILED
          await tx.taskCompletion.update({ where: { id: result.completion.id }, data: { state: "FAILED" } });
          throw new HttpError(400, "EXHAUSTED", "Campaign budget exhausted");
        }
        if (c.completedActions >= c.maxActions) {
          await tx.taskCompletion.update({ where: { id: result.completion.id }, data: { state: "FAILED" } });
          throw new HttpError(400, "FULL", "Campaign is full");
        }
        await tx.campaign.update({
          where: { id: c.id },
          data: { spentBudget: { increment: reward }, completedActions: { increment: 1 } },
        });
        await tx.taskCompletion.update({
          where: { id: result.completion.id },
          data: { state: "VERIFIED", verifiedAt: new Date() },
        });
        // Credit coins
        const credit = await creditCoins({
          userId: u!.user.id,
          amount: reward,
          type: "SUBSCRIBE_REWARD",
          referenceType: "TaskCompletion",
          referenceId: result.completion.id,
          note: `Subscribe reward for ${result.campaign.title}`,
        });
        return { credit, completionId: result.completion.id };
      });

      // Notification (best-effort)
      await prisma.notification.create({
        data: {
          userId: u!.user.id,
          kind: "SUBSCRIPTION_VERIFIED",
          title: `+${reward} coins`,
          body: `Subscription verified.`,
          link: "/transactions",
        },
      }).catch(() => {});

      // Gamification
      await addXp(u!.user.id, 25, "subscribe");
      await updateDailyStreak(u!.user.id);
      await incrementDailyQuest(u!.user.id, "SUBSCRIBE_CHANNELS");

      // Check if budget exhausted for notification
      const after = await prisma.campaign.findUnique({ where: { id: result.campaign.id } });
      if (after && after.spentBudget >= after.totalBudget) {
        await prisma.notification.create({
          data: {
            userId: after.ownerId,
            kind: "BUDGET_EXHAUSTED",
            title: "Campaign budget exhausted",
            body: after.title,
            link: "/boost",
          },
        }).catch(() => {});
      }

      return { ok: true, reward, balance: finalState.credit.balance };
    }).then((res) => NextResponse.json(res));
  } catch (e) {
    return handleError(e);
  }
}
