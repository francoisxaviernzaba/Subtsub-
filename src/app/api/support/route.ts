import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const items = await prisma.supportMessage.findMany({
      where: { userId: u.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true, email: true } } } } },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const body = await req.json().catch(() => ({}));
    const subject = (body?.subject as string | undefined)?.trim();
    const message = (body?.message as string | undefined)?.trim();
    if (!subject || !message) throw new HttpError(400, "BAD_REQUEST", "Subject and message are required");
    const item = await prisma.supportMessage.create({
      data: { userId: u.user.id, subject, message },
      include: { replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true, email: true } } } } },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
