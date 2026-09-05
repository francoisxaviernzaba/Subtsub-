import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const campaign = await prisma.campaign.findUnique({ where: { id: params.id }, include: { owner: { select: { email: true, name: true } } } });
    if (!campaign) throw new HttpError(404, "NOT_FOUND", "Campaign not found");
    return NextResponse.json({ campaign: { ...campaign, ownerEmail: campaign.owner.email, ownerName: campaign.owner.name } });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await req.json().catch(() => null);
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: body?.status,
        title: body?.title,
        totalBudget: body?.totalBudget !== undefined ? Number(body.totalBudget) : undefined,
        maxActions: body?.maxActions !== undefined ? Number(body.maxActions) : undefined,
        rewardPerAction: body?.rewardPerAction !== undefined ? Number(body.rewardPerAction) : undefined,
        spentBudget: body?.spentBudget !== undefined ? Number(body.spentBudget) : undefined,
        completedActions: body?.completedActions !== undefined ? Number(body.completedActions) : undefined,
      },
    });
    return NextResponse.json({ campaign });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
