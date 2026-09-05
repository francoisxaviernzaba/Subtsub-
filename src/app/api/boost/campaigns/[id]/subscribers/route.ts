import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";
import { checkSubscriptionViaCreator } from "@/lib/youtube";

type TaskCompletionWithUser = {
  id: string;
  userId: string;
  user: { id: string; email: string; name: string | null; image: string | null; youtubeChannel: { youtubeId: string } | null };
  state: string;
  rewardCoins: number;
  verifiedAt: Date | null;
  revokedAt: Date | null;
  revokeReason: string | null;
  targetChannelId: string | null;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { owner: { select: { email: true, name: true } } },
    });
    if (!campaign) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
    if (campaign.ownerId !== u.user.id && u.user.role !== "ADMIN") {
      throw new HttpError(403, "FORBIDDEN", "Only campaign owner or admin can view subscribers");
    }

    const completions = await prisma.taskCompletion.findMany({
      where: { campaignId: params.id, state: { in: ["VERIFIED", "PENDING", "REVOKED", "FAILED"] } },
      include: {
        user: { select: { id: true, email: true, name: true, image: true, youtubeChannel: { select: { youtubeId: true } } } },
      },
      orderBy: { verifiedAt: "desc" },
    });

    const items: any[] = [];
    for (const c of completions as TaskCompletionWithUser[]) {
      let liveVerified: boolean | null = null;
      let liveReason: string | null = null;
      if (c.state === "VERIFIED" && c.targetChannelId && c.user.youtubeChannel?.youtubeId) {
        try {
          const result = await checkSubscriptionViaCreator(null, null, c.user.youtubeChannel.youtubeId, c.targetChannelId);
          liveVerified = result.verified;
          liveReason = result.reason || null;
        } catch {
          liveVerified = null;
        }
      }
      items.push({
        id: c.id,
        userId: c.userId,
        userName: c.user.name,
        userEmail: c.user.email,
        userImage: c.user.image,
        state: c.state,
        rewardCoins: c.rewardCoins,
        verifiedAt: c.verifiedAt,
        revokedAt: c.revokedAt,
        revokeReason: c.revokeReason,
        liveVerified,
        liveReason,
      });
    }

    return NextResponse.json({ campaign: { id: campaign.id, title: campaign.title, owner: campaign.owner }, subscribers: items });
  } catch (e) {
    return handleError(e);
  }
}
