import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { getChannelById } from "@/lib/youtube";
import { getSettings } from "@/lib/settings";
import { debitCoins } from "@/lib/coins";
import { rateLimit, getClientKey } from "@/lib/ratelimit";

const Body = z.object({
  targetChannelId: z.string().min(1),
  reward: z.number().int().min(1),
  targetSubscribers: z.number().int().min(1).max(100000),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (!rateLimit(getClientKey(req, u.user.id), 5, 0.2)) throw new HttpError(429, "RATE_LIMIT", "Slow down");
    const body = await parseJson(req, Body);
    const settings = await getSettings();

    if (body.reward < settings.minRewardPerAction || body.reward > settings.maxRewardPerAction) {
      throw new HttpError(400, "BAD_REWARD", `Reward must be ${settings.minRewardPerAction}-${settings.maxRewardPerAction}`);
    }

    const ch = await getChannelById(body.targetChannelId);
    if (!ch) throw new HttpError(404, "NOT_FOUND", "Target channel not found via YouTube API");

    // ownership: the connected user must own the target channel
    const myCh = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (!myCh) throw new HttpError(400, "NO_YT", "Connect your YouTube channel first");
    if (myCh.youtubeId !== ch.id) {
      throw new HttpError(403, "NOT_OWNER", "Target channel must be your connected YouTube channel");
    }

    const totalBudget = body.reward * body.targetSubscribers;
    if (totalBudget > settings.maxBudget) throw new HttpError(400, "OVER_BUDGET", `Total budget exceeds max (${settings.maxBudget})`);

    const result = await prisma.$transaction(async (tx) => {
      const debit = await debitCoins({
        userId: u!.user.id,
        amount: totalBudget,
        type: "BOOST_SPEND",
        referenceType: "Campaign",
        note: `Boost S2S: ${ch.title}`,
        idempotencyKey: `boost.sub.${u!.user.id}.${ch.id}.${totalBudget}`,
      });
      const camp = await tx.campaign.create({
        data: {
          ownerId: u!.user.id,
          type: "SUBSCRIBER",
          status: "ACTIVE",
          youtubeChannelId: ch.id,
          title: `@${ch.handle || ch.title}`.slice(0, 200),
          thumbnailUrl: ch.thumbnailUrl ?? null,
          rewardPerAction: body.reward,
          totalBudget,
          spentBudget: 0,
          maxActions: body.targetSubscribers,
          completedActions: 0,
        },
      });
      return { camp, balance: debit.balance };
    });

    await prisma.notification.create({
      data: { userId: u.user.id, kind: "CAMPAIGN_ACTIVATED", title: "S2S campaign live", body: ch.title, link: "/boost" },
    }).catch(() => {});

    return NextResponse.json({ ok: true, campaignId: result.camp.id, balance: result.balance });
  } catch (e) {
    return handleError(e);
  }
}
