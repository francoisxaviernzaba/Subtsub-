import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const body = await req.json().catch(() => ({}));
    const message = (body?.message as string | undefined)?.trim();
    if (!message) throw new HttpError(400, "BAD_REQUEST", "Message is required");
    const msg = await prisma.supportMessage.findUnique({ where: { id: params.id } });
    if (!msg) throw new HttpError(404, "NOT_FOUND", "Message not found");
    if (msg.userId !== u.user.id) throw new HttpError(403, "FORBIDDEN", "Not your message");
    const reply = await prisma.supportReply.create({
      data: { messageId: params.id, userId: u.user.id, message, isAdmin: false },
      include: { user: { select: { name: true, email: true } } },
    });
    await prisma.supportMessage.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
    return NextResponse.json({ reply }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
