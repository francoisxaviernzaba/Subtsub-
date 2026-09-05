import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET() {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { owner: { select: { email: true, name: true } } } });
    return NextResponse.json({ campaigns: campaigns.map((c: any) => ({ id: c.id, ownerEmail: c.owner.email, type: c.type, status: c.status, title: c.title, spent: c.spentBudget, budget: c.totalBudget, completed: c.completedActions, max: c.maxActions, createdAt: c.createdAt.toISOString() })) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => null);
    if (!body?.ownerId || !body?.type || !body?.title || !body?.totalBudget || !body?.maxActions) throw new HttpError(400, "VALIDATION", "Missing fields");
    const campaign = await prisma.campaign.create({
      data: {
        ownerId: body.ownerId,
        type: body.type,
        status: body.status || "ACTIVE",
        title: body.title,
        totalBudget: Number(body.totalBudget),
        maxActions: Number(body.maxActions),
        rewardPerAction: Number(body.rewardPerAction || 0),
        youtubeChannelId: body.youtubeChannelId || null,
        youtubeVideoId: body.youtubeVideoId || null,
        minWatchSeconds: Number(body.minWatchSeconds || 0),
      },
    });
    return NextResponse.json({ campaign: { id: campaign.id } });
  } catch (e) {
    return handleError(e);
  }
}
