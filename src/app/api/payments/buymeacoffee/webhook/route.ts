import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creditCoins } from "@/lib/coins";
import crypto from "node:crypto";

const COIN_MAP: Record<string, number> = {
  [process.env.BUYMEACOFFEE_PRODUCT_500 || ""]: 500,
  [process.env.BUYMEACOFFEE_PRODUCT_1500 || ""]: 1500,
  [process.env.BUYMEACOFFEE_PRODUCT_5000 || ""]: 5000,
  [process.env.BUYMEACOFFEE_PRODUCT_12000 || ""]: 12000,
  [process.env.BUYMEACOFFEE_PRODUCT_30000 || ""]: 30000,
};

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.BUYMEACOFFEE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-signature-sha256");
    if (!signature) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const expectedSign = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSign))) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;

    if (eventType === "extra_purchase.created") {
      const data = payload.data || {};
      const productSlug = data.product_id || data.product_slug || "";
      const email = data.buyer?.email || data.email || "";
      const amountCents = Math.round((data.amount || 0) * 100);
      const coins = COIN_MAP[productSlug];

      if (!email || !coins) {
        return NextResponse.json({ ok: false, error: "Invalid product or missing email" }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }

      const pending = await prisma.payment.findFirst({
        where: { userId: user.id, provider: "buymeacoffee", status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });

      const paymentId = pending?.id || `bmac_${user.id}_${Date.now()}`;

      await prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!existing) {
          await tx.payment.create({
            data: {
              id: paymentId,
              userId: user.id,
              provider: "buymeacoffee",
              providerRef: `bmac_${Date.now()}`,
              status: "SUCCEEDED",
              coins,
              amountCents,
              currency: data.currency || "USD",
              completedAt: new Date(),
            },
          });
        } else if (existing.status !== "SUCCEEDED") {
          await tx.payment.update({
            where: { id: existing.id },
            data: { status: "SUCCEEDED", completedAt: new Date() },
          });
        }

        await creditCoins({
          userId: user.id,
          amount: coins,
          type: "COIN_PURCHASE",
          referenceType: "Payment",
          referenceId: paymentId,
          note: `Buy Me a Coffee purchase (${productSlug})`,
          idempotencyKey: `bmac.credit.${paymentId}`,
        });
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          kind: "COIN_PURCHASE",
          title: `+${coins} coins`,
          body: "Your coin purchase has been credited!",
          link: "/transactions",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Buy Me a Coffee webhook error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
