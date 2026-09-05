import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkSubscriptionViaCreator } from "@/lib/youtube";
import { decryptToken } from "@/lib/crypto";
import { creditCoins } from "@/lib/coins";

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const completions = await prisma.taskCompletion.findMany({
      where: {
        state: "VERIFIED",
        verifiedAt: { lt: since },
        campaign: { type: "SUBSCRIBER", status: "ACTIVE" },
        targetChannelId: { not: null },
      },
      include: {
        campaign: { select: { ownerId: true, youtubeChannelId: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      take: 500,
    });

    const results = { checked: 0, stillSubscribed: 0, unsubscribed: 0, errors: 0 };

    for (const comp of completions) {
      results.checked++;
      try {
        const creatorChannel = await prisma.youTubeChannel.findUnique({
          where: { userId: comp.campaign.ownerId },
          select: { accessTokenCipher: true, refreshTokenCipher: true },
        });
        if (!creatorChannel?.accessTokenCipher) {
          results.errors++;
          continue;
        }

        const verify = await checkSubscriptionViaCreator(
          decryptToken(creatorChannel.accessTokenCipher),
          creatorChannel.refreshTokenCipher ? decryptToken(creatorChannel.refreshTokenCipher) : null,
          comp.userId,
          comp.targetChannelId!,
        );

        if (!verify.verified) {
          await prisma.$transaction(async (tx) => {
            await tx.taskCompletion.update({
              where: { id: comp.id },
              data: { state: "FAILED", failureReason: "AUDIT_UNSUBSCRIBED" },
            });
            await tx.campaign.update({
              where: { id: comp.campaignId },
              data: { spentBudget: { decrement: comp.rewardCoins }, completedActions: { decrement: 1 } },
            });
            await creditCoins({
              userId: comp.userId,
              amount: comp.rewardCoins,
              type: "REVERSAL",
              referenceType: "TaskCompletion",
              referenceId: comp.id,
              note: `Nightly audit reversal: unsubscribed from ${comp.campaign.title}`,
              idempotencyKey: `audit.reversal.${comp.id}`,
            });
          });
          results.unsubscribed++;
        } else {
          results.stillSubscribed++;
        }
      } catch {
        results.errors++;
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    console.error("[audit] nightly audit failed", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
