import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.ip || "unknown";
}

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const ip = getClientIp(req);
    const sessions = await prisma.deviceSession.findMany({
      where: { ipAddress: ip },
      include: { user: { select: { id: true, email: true, name: true, image: true } } },
      orderBy: { lastUsedAt: "desc" },
    });
    const uniqueUsers = sessions.filter((s: any, i: number, arr: any[]) => i === arr.findIndex((x: any) => x.userId === s.userId)).slice(0, 2);
    return NextResponse.json({ accounts: uniqueUsers.map((s: any) => ({ id: s.user.id, email: s.user.email, name: s.user.name, image: s.user.image })) });
  } catch (e) {
    return handleError(e);
  }
}
