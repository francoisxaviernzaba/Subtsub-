import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { parseVideoId, getVideoById, ytThumbFromVideoId } from "@/lib/youtube";
import { getSettings } from "@/lib/settings";
import { debitCoins } from "@/lib/coins";
import { rateLimit, getClientKey } from "@/lib/ratelimit";

const Body = z.object({
  url: z.string().min(1),
  reward: z.number().int().min(1),
  budget: z.number().int().min(1),
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
    if (body.budget < settings.minBudget || body.budget > settings.maxBudget) {
      throw new HttpError(400, "BAD_BUDGET", `Budget must be ${settings.minBudget}-${settings.maxBudget}`);
    }
    if (body.budget % body.reward !== 0) {
      throw new HttpError(400, "BAD_DIVISION", "Budget must be divisible by reward");
    }

    const id = parseVideoId(body.url);
    if (!id) throw new HttpError(400, "BAD_URL", "Invalid video URL");
    const v = await getVideoById(id);
    if (!v) throw new HttpError(404, "NOT_FOUND", "Video not found via YouTube API");

    // Verify ownership: the connected channel must match the video's channel
    const myCh = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (!myCh) throw new HttpError(400, "NO_YT", "Connect your YouTube channel first");
    if (v.channelId !== myCh.youtubeId) {
      throw new HttpError(403, "NOT_OWNER", "This video does not belong to your connected YouTube channel");
    }

    const maxActions = Math.floor(body.budget / body.reward);
    const result = await prisma.$transaction(async (tx) => {
      // Debit coins atomically
      const debit = await debitCoins({
        userId: u!.user.id,
        amount: body.budget,
        type: "BOOST_SPEND",
        referenceType: "Campaign",
        note: `Boost video: ${v.title}`,
        idempotencyKey: `boost.video.${u!.user.id}.${v.id}.${body.budget}`,
      });
      const camp = await tx.campaign.create({
        data: {
          ownerId: u!.user.id,
          type: "VIDEO_VIEW",
          status: "ACTIVE",
          youtubeVideoId: v.id,
          title: v.title.slice(0, 200),
          thumbnailUrl: v.thumbnailUrl || ytThumbFromVideoId(v.id),
          rewardPerAction: body.reward,
          totalBudget: body.budget,
          spentBudget: 0,
          maxActions,
          completedActions: 0,
          minWatchSeconds: settings.minWatchSeconds,
        },
      });
      return { camp, balance: debit.balance };
    });

    await prisma.notification.create({
      data: {
        userId: u.user.id,
        kind: "CAMPAIGN_ACTIVATED",
        title: "Video campaign live",
        body: v.title,
        link: "/boost",
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, campaignId: result.camp.id, balance: result.balance });
  } catch (e) {
    return handleError(e);
  }
}
