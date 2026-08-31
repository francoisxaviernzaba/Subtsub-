import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";

const Body = z.object({ name: z.string().min(1).max(60), username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore").optional().or(z.literal("")) });

export async function PATCH(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const body = await parseJson(req, Body);
    const data: any = { name: body.name };
    if (body.username) data.username = body.username.toLowerCase();
    // ensure username unique
    if (data.username) {
      const exists = await prisma.user.findFirst({ where: { username: data.username, id: { not: u.user.id } } });
      if (exists) throw new HttpError(409, "TAKEN", "Username already taken");
    }
    await prisma.user.update({ where: { id: u.user.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const me = await prisma.user.findUnique({ where: { id: u.user.id } });
    const yt = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    const balance = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id }, _sum: { deltaCoins: true } });
    return NextResponse.json({ user: me, youtube: yt, balance: balance._sum.deltaCoins ?? 0 });
  } catch (e) {
    return handleError(e);
  }
}
