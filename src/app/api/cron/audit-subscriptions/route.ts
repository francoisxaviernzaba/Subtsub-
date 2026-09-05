import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkSubscriptionViaCreator } from "@/lib/youtube";
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
        user: { select: { id: true, name: true, email: true, youtubeChannel: { select: { youtubeId: true } } } },
      },
      take: 500,
    });

    const results = { checked: 0, stillSubscribed: 0, unsubscribed: 0, errors: 0 };

    for (const comp of completions) {
      results.checked++;
      try {
        const userYoutubeId = comp.user.youtubeChannel?.youtubeId;
        if (!userYoutubeId) {
          results.errors++;
          continue;
        }

        const verify = await checkSubscriptionViaCreator(
          null,
          null,
          userYoutubeId,
          comp.targetChannelId!,
        );

        if (!verify.verified) {
          await prisma.$transaction(async (tx) => {
            await tx.taskCompletion.update({
              where: { id: comp.id },
              data: { state: "FAILED", failureReason: "AUDIT_VERIFICATION_FAILED" },
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
              note: `Nightly audit reversal: ${verify.reason || "verification failed"} for ${comp.campaign.title}`,
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
