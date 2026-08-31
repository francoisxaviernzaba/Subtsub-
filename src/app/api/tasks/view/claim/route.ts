import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError, withIdempotency } from "@/lib/api";
import { rateLimit, getClientKey } from "@/lib/ratelimit";
import { creditCoins } from "@/lib/coins";
import { getSettings } from "@/lib/settings";

const Body = z.object({
  campaignId: z.string().min(1),
  watchSeconds: z.number().int().min(0).max(60 * 60 * 6),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (!rateLimit(getClientKey(req, u.user.id), 5, 0.3)) throw new HttpError(429, "RATE_LIMIT", "Slow down");
    const body = await req.json().catch(() => null);
    const parsed = Body.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "VALIDATION", parsed.error.message);
    const { campaignId, watchSeconds, idempotencyKey } = parsed.data;

    return await withIdempotency(u.user.id, "view.claim", idempotencyKey ?? null, async () => {
      const settings = await getSettings();

      // Dedup per (user, campaign)
      const existing = await prisma.taskCompletion.findFirst({
        where: { userId: u!.user.id, campaignId },
      });
      if (existing) {
        if (existing.state === "VERIFIED") throw new HttpError(409, "DUPLICATE", "You already earned for this campaign");
        if (existing.state === "PENDING") throw new HttpError(409, "PENDING", "Verification in progress");
      }

      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
      if (campaign.type !== "VIDEO_VIEW") throw new HttpError(400, "WRONG_TYPE", "Not a video campaign");
      if (campaign.status !== "ACTIVE") throw new HttpError(400, "INACTIVE", "Campaign inactive");
      if (campaign.ownerId === u!.user.id) throw new HttpError(400, "SELF", "Cannot view your own campaign");

      if (watchSeconds < campaign.minWatchSeconds) {
        throw new HttpError(400, "WATCH_TOO_SHORT", `Watch at least ${campaign.minWatchSeconds} seconds before claiming.`);
      }

      const reward = Math.min(campaign.rewardPerAction, settings.maxRewardPerAction);

      // Atomic ledger + campaign reserve
      const result = await prisma.$transaction(async (tx) => {
        const c = await tx.campaign.findUnique({ where: { id: campaignId } });
        if (!c) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
        if (c.spentBudget + reward > c.totalBudget) {
          throw new HttpError(400, "EXHAUSTED", "Campaign budget exhausted");
        }
        if (c.completedActions >= c.maxActions) {
          throw new HttpError(400, "FULL", "Campaign is full");
        }
        await tx.campaign.update({
          where: { id: c.id },
          data: { spentBudget: { increment: reward }, completedActions: { increment: 1 } },
        });
        const completion = await tx.taskCompletion.upsert({
          where: { id: existing?.id ?? "_new_" },
          create: {
            userId: u!.user.id,
            campaignId: c.id,
            targetChannelId: null,
            state: "VERIFIED",
            rewardCoins: reward,
            watchSeconds,
            verifiedAt: new Date(),
            idempotencyKey: idempotencyKey ?? null,
          },
          update: {
            state: "VERIFIED",
            rewardCoins: reward,
            watchSeconds,
            verifiedAt: new Date(),
          },
        }).catch(async () => {
          // upsert by composite not supported on SQLite; create new
          return tx.taskCompletion.create({
            data: {
              userId: u!.user.id,
              campaignId: c.id,
              state: "VERIFIED",
              rewardCoins: reward,
              watchSeconds,
              verifiedAt: new Date(),
              idempotencyKey: idempotencyKey ?? null,
            },
          });
        });
        const credit = await creditCoins({
          userId: u!.user.id,
          amount: reward,
          type: "VIEW_REWARD",
          referenceType: "TaskCompletion",
          referenceId: completion.id,
          note: `View reward for ${c.title}`,
          idempotencyKey: `view.credit.${completion.id}`,
        });
        return { reward, balance: credit.balance, completionId: completion.id };
      });

      // notify
      await prisma.notification.create({
        data: {
          userId: u!.user.id,
          kind: "VIEW_REWARD",
          title: `+${result.reward} coins`,
          body: "View reward verified.",
          link: "/transactions",
        },
      }).catch(() => {});

      const after = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (after && after.spentBudget >= after.totalBudget) {
        await prisma.notification.create({
          data: { userId: after.ownerId, kind: "BUDGET_EXHAUSTED", title: "Campaign budget exhausted", body: after.title, link: "/boost" },
        }).catch(() => {});
      }

      return { ok: true, reward: result.reward, balance: result.balance };
    }).then((res) => NextResponse.json(res));
  } catch (e) {
    return handleError(e);
  }
}
