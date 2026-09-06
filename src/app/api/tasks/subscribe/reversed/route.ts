import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");

    const reversed = await prisma.taskCompletion.findMany({
      where: {
        userId: u.user.id,
        state: "REVERSED",
        campaign: { type: "SUBSCRIBER" },
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            youtubeChannelId: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const items = reversed.map((c) => ({
      id: c.id,
      campaignId: c.campaign.id,
      title: c.campaign.title,
      channelId: c.campaign.youtubeChannelId,
      thumbnailUrl: c.campaign.thumbnailUrl,
      rewardCoins: c.rewardCoins,
      failureReason: c.failureReason,
      revokedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return handleError(e);
  }
}
