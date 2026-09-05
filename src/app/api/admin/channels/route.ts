import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET() {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const channels = await prisma.youTubeChannel.findMany({ orderBy: { connectedAt: "desc" }, take: 100, include: { user: { select: { email: true, name: true } } } });
    return NextResponse.json({ channels: channels.map((c: any) => ({ id: c.id, userId: c.userId, userEmail: c.user.email, youtubeId: c.youtubeId, handle: c.handle, title: c.title, verified: c.verified, subscriberCount: c.subscriberCount, connectedAt: c.connectedAt.toISOString() })) });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => null);
    if (!body?.id) throw new HttpError(400, "VALIDATION", "Channel id required");
    await prisma.youTubeChannel.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
