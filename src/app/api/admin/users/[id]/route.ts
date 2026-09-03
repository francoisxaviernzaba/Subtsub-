import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true, lastSeenAt: true, xp: true, level: true, dailyStreak: true, totalEarned: true, bio: true, publicProfile: true, youtubeChannel: true },
    });
    if (!user) throw new HttpError(404, "NOT_FOUND", "User not found");
    return NextResponse.json({ user });
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
    if (typeof body.name === "string") data.name = body.name.trim() || null;
    if (typeof body.email === "string") data.email = body.email.trim().toLowerCase();
    if (body.role) data.role = body.role;
    if (body.status) data.status = body.status;
    if (typeof body.bio === "string") data.bio = body.bio.trim() || null;
    if (typeof body.publicProfile === "boolean") data.publicProfile = body.publicProfile;
    const user = await prisma.user.update({ where: { id: params.id }, data });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, createdAt: user.createdAt.toISOString() } });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
