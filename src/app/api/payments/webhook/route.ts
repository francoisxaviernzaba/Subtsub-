import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { creditCoins } from "@/lib/coins";
import { handleError, HttpError } from "@/lib/api";

/**
 * Webhook for payment provider events. In production, verify signature here.
 * Body: { providerRef: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.providerRef) throw new HttpError(400, "BAD_REQUEST", "Missing providerRef");
    const provider = getPaymentProvider();
    const verify = await provider.verifyPayment(body.providerRef);
    if (verify.status !== "SUCCEEDED") return NextResponse.json({ ok: true, status: verify.status });

    const payment = await prisma.payment.findFirst({ where: { providerRef: body.providerRef } });
    if (!payment) throw new HttpError(404, "NOT_FOUND", "Payment not found");
    if (payment.status === "SUCCEEDED") return NextResponse.json({ ok: true, already: true });

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED", completedAt: new Date() } });
      await creditCoins({
        userId: payment.userId,
        amount: payment.coins,
        type: "COIN_PURCHASE",
        referenceType: "Payment",
        referenceId: payment.id,
        note: `Purchased ${payment.coins} coins`,
        idempotencyKey: `pay.credit.${payment.id}`,
      });
    });
    await prisma.notification.create({
      data: { userId: payment.userId, kind: "COIN_PURCHASE", title: `+${payment.coins} coins`, body: "Purchase confirmed", link: "/transactions" },
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
