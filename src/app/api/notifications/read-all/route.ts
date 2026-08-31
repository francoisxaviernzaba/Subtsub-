import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    await prisma.notification.updateMany({
      where: { userId: u.user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
