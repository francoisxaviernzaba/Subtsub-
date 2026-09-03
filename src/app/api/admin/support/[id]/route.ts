import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => ({}));
    const message = (body?.message as string | undefined)?.trim();
    if (!message) throw new HttpError(400, "BAD_REQUEST", "Message is required");
    const msg = await prisma.supportMessage.findUnique({ where: { id: params.id } });
    if (!msg) throw new HttpError(404, "NOT_FOUND", "Message not found");
    const reply = await prisma.supportReply.create({
      data: { messageId: params.id, userId: u.user.id, message, isAdmin: true },
      include: { user: { select: { name: true, email: true } } },
    });
    await prisma.supportMessage.update({ where: { id: params.id }, data: { status: "IN_PROGRESS", updatedAt: new Date() } });
    return NextResponse.json({ reply }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (body?.status) data.status = body.status;
    if (body?.priority) data.priority = body.priority;
    if (body?.resolvedAt) data.resolvedAt = new Date(body.resolvedAt);
    const msg = await prisma.supportMessage.update({ where: { id: params.id }, data });
    return NextResponse.json({ item: msg });
  } catch (e) {
    return handleError(e);
  }
}
