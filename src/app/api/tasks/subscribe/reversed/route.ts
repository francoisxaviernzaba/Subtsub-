import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkSubscriptionViaSubscriberOAuth, refreshAccessToken } from "@/lib/youtube";
import { debitCoins } from "@/lib/coins";
import { handleError, HttpError } from "@/lib/api";
import { decryptToken } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");

    const myChannel = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (!myChannel?.accessTokenCipher) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const verified = await prisma.taskCompletion.findMany({
      where: {
        userId: u.user.id,
        state: "VERIFIED",
        campaign: { type: "SUBSCRIBER" },
        targetChannelId: { not: null },
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
    });

    const reversed: any[] = [];
    const authErrors: any[] = [];

    for (const completion of verified) {
      try {
        let token = decryptToken(myChannel.accessTokenCipher);
        if (myChannel.refreshTokenCipher) {
          try {
            token = await refreshAccessToken(decryptToken(myChannel.refreshTokenCipher));
          } catch {
            token = decryptToken(myChannel.accessTokenCipher);
          }
        }
        const result = await checkSubscriptionViaSubscriberOAuth(token, completion.targetChannelId!);
        if (!result.verified) {
          if (result.reason === "NOT_SUBSCRIBED") {
            await prisma.$transaction(async (tx) => {
              await tx.taskCompletion.update({
                where: { id: completion.id },
                data: { state: "REVERSED", failureReason: result.reason || "NOT_SUBSCRIBED" },
              });
              await debitCoins({
                userId: u.user.id,
                amount: completion.rewardCoins,
                type: "REVERSAL",
                referenceType: "TaskCompletion",
                referenceId: completion.id,
                note: `Real-time reversal: ${result.reason || "not subscribed"} for ${completion.campaign.title}`,
                idempotencyKey: `realtime.reversal.${completion.id}`,
              });
              await tx.campaign.update({
                where: { id: completion.campaignId },
                data: { spentBudget: { decrement: completion.rewardCoins }, completedActions: { decrement: 1 } },
              });
            });
            reversed.push({
              id: completion.id,
              campaignId: completion.campaign.id,
              title: completion.campaign.title,
              channelId: completion.campaign.youtubeChannelId,
              thumbnailUrl: completion.campaign.thumbnailUrl,
              rewardCoins: completion.rewardCoins,
              failureReason: result.reason || "NOT_SUBSCRIBED",
              revokedAt: new Date().toISOString(),
            });
          } else if (result.reason?.startsWith("API_ERROR_")) {
            authErrors.push({
              id: completion.id,
              campaignId: completion.campaign.id,
              title: completion.campaign.title,
              channelId: completion.campaign.youtubeChannelId,
              thumbnailUrl: completion.campaign.thumbnailUrl,
              rewardCoins: completion.rewardCoins,
              failureReason: result.reason,
            });
          }
        }
      } catch {
        // skip failed checks
      }
    }

    return NextResponse.json({ ok: true, items: reversed, authErrors });
  } catch (e) {
    return handleError(e);
  }
}
