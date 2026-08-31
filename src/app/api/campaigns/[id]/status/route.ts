import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";

const Body = z.object({ status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const { status } = await parseJson(req, Body);
    const c = await prisma.campaign.findUnique({ where: { id: params.id } });
    if (!c) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
    if (c.ownerId !== u.user.id) throw new HttpError(403, "FORBIDDEN", "Not your campaign");
    if (status === "CANCELLED") {
      // refund remaining budget
      const remaining = Math.max(0, c.totalBudget - c.spentBudget);
      if (remaining > 0) {
        await prisma.$transaction(async (tx) => {
          const { creditCoins } = await import("@/lib/coins");
          await creditCoins({
            userId: u.user.id,
            amount: remaining,
            type: "BOOST_REFUND",
            referenceType: "Campaign",
            referenceId: c.id,
            note: `Refund for cancelled campaign ${c.id}`,
            idempotencyKey: `boost.refund.${c.id}`,
          });
          await tx.campaign.update({ where: { id: c.id }, data: { status: "CANCELLED" } });
        });
      } else {
        await prisma.campaign.update({ where: { id: c.id }, data: { status: "CANCELLED" } });
      }
    } else {
      await prisma.campaign.update({ where: { id: c.id }, data: { status } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
