import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const items = await prisma.supportMessage.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true, image: true } }, replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true, email: true } } } } },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return handleError(e);
  }
}
