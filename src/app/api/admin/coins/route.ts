import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { creditCoins, debitCoins } from "@/lib/coins";

const Body = z.object({
  userId: z.string().min(1),
  amount: z.number().int(),
  note: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await parseJson(req, Body);
    if (body.amount === 0) throw new HttpError(400, "ZERO", "Amount must be non-zero");
    const target = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!target) throw new HttpError(404, "NOT_FOUND", "User not found");

    if (body.amount > 0) {
      await creditCoins({
        userId: body.userId,
        amount: body.amount,
        type: "ADMIN_ADJUSTMENT",
        note: body.note,
        idempotencyKey: `admin.adj.${u.user.id}.${body.userId}.${body.amount}.${Date.now()}`,
      });
    } else {
      await debitCoins({
        userId: body.userId,
        amount: -body.amount,
        type: "ADMIN_ADJUSTMENT",
        note: body.note,
        idempotencyKey: `admin.adj.${u.user.id}.${body.userId}.${body.amount}.${Date.now()}`,
      });
    }
    await prisma.adminAction.create({
      data: {
        adminId: u.user.id,
        action: body.amount > 0 ? "ADJUST_COINS_ADD" : "ADJUST_COINS_REMOVE",
        targetType: "User",
        targetId: body.userId,
        payload: JSON.stringify({ amount: body.amount, note: body.note }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
