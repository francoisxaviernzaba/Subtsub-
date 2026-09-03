import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const user = await prisma.user.findUnique({
      where: { id: u.user.id },
      select: { inviteCode: true, invitedCount: true, inviteCompletedAt: true },
    });
    if (!user) throw new HttpError(404, "NOT_FOUND", "User not found");
    return NextResponse.json({ inviteCode: user.inviteCode, invitedCount: user.invitedCount, inviteCompletedAt: user.inviteCompletedAt });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const existing = await prisma.user.findUnique({ where: { id: u.user.id }, select: { inviteCode: true } });
    if (existing?.inviteCode) {
      return NextResponse.json({ inviteCode: existing.inviteCode });
    }
    const code = generateCode();
    const user = await prisma.user.update({
      where: { id: u.user.id },
      data: { inviteCode: code },
      select: { inviteCode: true },
    });
    return NextResponse.json({ inviteCode: user.inviteCode });
  } catch (e) {
    return handleError(e);
  }
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[bytes[i] % chars.length];
  return out;
}
