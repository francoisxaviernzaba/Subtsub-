import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";
import { creditCoins } from "@/lib/coins";
import { rateLimit, getClientKey } from "@/lib/ratelimit";

const Body = z.object({
  coins: z.number().int().min(1).max(10_000_000),
  amountCents: z.number().int().min(1).max(1_000_000_00),
  currency: z.string().min(3).max(8).default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (!rateLimit(getClientKey(req, u.user.id), 5, 0.2)) throw new HttpError(429, "RATE_LIMIT", "Slow down");
    const body = await parseJson(req, Body);
    const provider = getPaymentProvider();

    const origin = new URL(req.url).origin;
    const currency = body.currency || "USD";
    const intent = await provider.createPayment({
      userId: u.user.id,
      coins: body.coins,
      amountCents: body.amountCents,
      currency,
      successUrl: `${origin}/coins?status=success`,
      cancelUrl: `${origin}/coins?status=cancelled`,
    });

    if (intent.status === "SUCCEEDED" || intent.mock) {
      // atomic: create payment + credit
      const result = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.create({
          data: {
            userId: u!.user.id,
            provider: provider.name,
            providerRef: intent.providerRef,
            status: "SUCCEEDED",
            coins: body.coins,
            amountCents: body.amountCents,
            currency,
            completedAt: new Date(),
            metadata: JSON.stringify({ mock: !!intent.mock }),
          },
        });
        const credit = await creditCoins({
          userId: u!.user.id,
          amount: body.coins,
          type: "COIN_PURCHASE",
          referenceType: "Payment",
          referenceId: p.id,
          note: `Purchased ${body.coins} coins`,
          idempotencyKey: `pay.credit.${p.id}`,
        });
        return { paymentId: p.id, credited: body.coins, balance: credit.balance };
      });
      await prisma.notification.create({
        data: { userId: u.user.id, kind: "COIN_PURCHASE", title: `+${body.coins} coins`, body: "Purchase credited", link: "/transactions" },
      }).catch(() => {});
      return NextResponse.json({ ok: true, mock: true, ...result });
    }

    // For real providers: create PENDING payment and return checkoutUrl
    const p = await prisma.payment.create({
      data: {
        userId: u.user.id,
        provider: provider.name,
        providerRef: intent.providerRef,
        status: "PENDING",
        coins: body.coins,
        amountCents: body.amountCents,
        currency: body.currency,
      },
    });
    return NextResponse.json({ ok: true, paymentId: p.id, provider: provider.name, checkoutUrl: intent.checkoutUrl, providerRef: intent.providerRef });
  } catch (e) {
    return handleError(e);
  }
}
