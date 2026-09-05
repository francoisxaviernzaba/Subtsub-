import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.ip || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const body = await req.json().catch(() => null);
    if (!body?.userId) throw new HttpError(400, "VALIDATION", "Target userId required");
    if (body.userId === u.user.id) return NextResponse.json({ ok: true });

    const ip = getClientIp(req);
    const count = await prisma.deviceSession.count({ where: { ipAddress: ip, userId: { not: u.user.id } } });
    if (count >= 2) throw new HttpError(403, "LIMIT_EXCEEDED", "Maximum 2 accounts per IP");

    const existing = await prisma.deviceSession.findFirst({ where: { ipAddress: ip, userId: body.userId } });
    if (existing) {
      await prisma.deviceSession.update({ where: { id: existing.id }, data: { lastUsedAt: new Date() } });
    } else {
      await prisma.deviceSession.create({ data: { ipAddress: ip, userId: body.userId, userAgent: req.headers.get("user-agent") || undefined } });
    }

    return NextResponse.json({ ok: true, switchTo: body.userId });
  } catch (e) {
    return handleError(e);
  }
}
