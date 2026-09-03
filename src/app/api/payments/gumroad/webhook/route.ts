import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creditCoins } from "@/lib/coins";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("X-Gumroad-Signature");
    if (!signature) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Verify Gumroad webhook signature
    const expectedSign = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSign))) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    
    // Gumroad sends various event types
    // For payments, we care about: sale, refund, dispute
    const eventType = payload.event_type || payload.type;
    
    if (eventType === "sale" || eventType === "subscription_started") {
      const productId = payload.product_id;
      const email = payload.email;
      const userId = payload.user_id; // We passed this in custom fields
      const paymentId = payload.payment_id || payload.id;
      
      // Find user by email or userId
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { id: userId },
          ],
        },
      });

      if (!user) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }

      // Find the pending payment
      const payment = await prisma.payment.findFirst({
        where: {
          provider: "gumroad",
          providerRef: paymentId,
          userId: user.id,
        },
      });

      // If no payment found by providerRef, try to find by userId and status
      const pendingPayment = payment || await prisma.payment.findFirst({
        where: {
          provider: "gumroad",
          userId: user.id,
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!pendingPayment) {
        return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
      }

      if (pendingPayment.status === "SUCCEEDED") {
        return NextResponse.json({ ok: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: pendingPayment.id },
          data: { status: "SUCCEEDED", completedAt: new Date() },
        });
        await creditCoins({
          userId: user.id,
          amount: pendingPayment.coins,
          type: "COIN_PURCHASE",
          referenceType: "Payment",
          referenceId: pendingPayment.id,
          note: `Gumroad purchase (${productId})`,
          idempotencyKey: `gumroad.credit.${pendingPayment.id}`,
        });
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          kind: "COIN_PURCHASE",
          title: `+${pendingPayment.coins} coins`,
          body: "Your coin purchase has been credited!",
          link: "/transactions",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Gumroad webhook error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
