import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creditCoins } from "@/lib/coins";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchant_id, order_id, status, uuid, amount, currency, sign } = body;

    const apiKey = process.env.CRYPTOMUS_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Verify signature
    const data = body as Record<string, any>;
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === "sign") continue;
      if (v !== undefined && v !== null) filtered[k] = String(v);
    }
    const payload = Object.keys(filtered)
      .sort()
      .map((k) => `${k}${filtered[k]}`)
      .join("");
    const expectedSign = crypto.createHash("md5").update(`${merchant_id}${apiKey}${payload}`).digest("hex");
    if (sign !== expectedSign) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Find payment by providerRef
    const payment = await prisma.payment.findFirst({
      where: { provider: "cryptomus", providerRef: uuid || order_id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (payment.status === "SUCCEEDED") {
      return NextResponse.json({ ok: true });
    }

    if (status === "paid" || status === "completed") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCEEDED", completedAt: new Date() },
        });
        if (payment.status !== "SUCCEEDED") {
          await creditCoins({
            userId: payment.userId,
            amount: payment.coins,
            type: "COIN_PURCHASE",
            referenceType: "Payment",
            referenceId: payment.id,
            note: `Cryptomus payment ${uuid}`,
            idempotencyKey: `cryptomus.credit.${payment.id}`,
          });
        }
      });
    } else if (status === "failed" || status === "canceled") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
