import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const count = await prisma.notification.count({ where: { userId: u.user.id, read: false } });
    return NextResponse.json({ count });
  } catch (e) {
    return handleError(e);
  }
}
