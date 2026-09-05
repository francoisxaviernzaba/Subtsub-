import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Number(searchParams.get("limit") || 50);
    const txns = await prisma.coinTransaction.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
      include: { user: { select: { email: true, name: true } } },
    });
    return NextResponse.json({ transactions: txns.map((t: any) => ({ id: t.id, userId: t.userId, userEmail: t.user.email, delta: t.deltaCoins, type: t.type, referenceType: t.referenceType, referenceId: t.referenceId, note: t.note, createdAt: t.createdAt.toISOString() })) });
  } catch (e) {
    return handleError(e);
  }
}
