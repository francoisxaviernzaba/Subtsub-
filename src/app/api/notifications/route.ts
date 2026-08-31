import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const items = await prisma.notification.findMany({
      where: { userId: u.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    return handleError(e);
  }
}
