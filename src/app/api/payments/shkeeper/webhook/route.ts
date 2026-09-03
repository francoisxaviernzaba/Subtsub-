import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creditCoins } from "@/lib/coins";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SHKEEPER_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const timestamp = req.headers.get("X-Shkeeper-Timestamp");
    const signature = req.headers.get("X-Shkeeper-Signature");
    if (!timestamp || !signature) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const rawBody = await req.text();
    const expectedSign = crypto.createHmac("sha256", apiKey).update(`${timestamp}.${rawBody}`).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSign))) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const externalId = payload.external_id;
    if (!externalId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { provider: "shkeeper", providerRef: externalId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (payment.status === "SUCCEEDED") {
      return NextResponse.json({ ok: true });
    }

    if (payload.status === "PAID" || payload.status === "OVERPAID") {
      const amount = payload.balance_fiat ? parseFloat(payload.balance_fiat) : null;
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
            note: `SHKeeper payment ${externalId}`,
            idempotencyKey: `shkeeper.credit.${payment.id}`,
          });
        }
      });
    } else if (payload.status === "PARTIAL" || payload.status === "FAILED" || payload.status === "CANCELED") {
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
