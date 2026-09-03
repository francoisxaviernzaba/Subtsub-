import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET() {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true, lastSeenAt: true, xp: true, level: true, dailyStreak: true, totalEarned: true, bio: true, publicProfile: true, youtubeChannel: { select: { title: true, handle: true, thumbnailUrl: true, subscriberCount: true, verified: true } } },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => ({}));
    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const name = (body?.name as string | undefined)?.trim() || null;
    const role = (body?.role as string | undefined)?.trim() || "USER";
    const status = (body?.status as string | undefined)?.trim() || "ACTIVE";
    if (!email) throw new HttpError(400, "BAD_REQUEST", "Email is required");
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new HttpError(409, "CONFLICT", "Email already exists");
    const user = await prisma.user.create({ data: { email, name, role, status } });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, createdAt: user.createdAt.toISOString() } }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
