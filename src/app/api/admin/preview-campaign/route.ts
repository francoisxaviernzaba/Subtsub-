import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";

const Body = z.object({
  campaignId: z.string().min(1),
});

/**
 * Admin preview endpoint.
 * Marks a campaign as "viewed" by an admin without crediting coins or
 * incrementing the campaign's spentBudget. The admin's session is stored
 * as a TaskCompletion with isAdminPreview=true so it shows up in the
 * discover query and excludes this admin from seeing the campaign again.
 */
export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (u.user.role !== "ADMIN") throw new HttpError(403, "NOT_ADMIN", "Admins only");
    const body = await parseJson(req, Body);

    const campaign = await prisma.campaign.findUnique({ where: { id: body.campaignId } });
    if (!campaign) throw new HttpError(404, "NOT_FOUND", "Campaign not found");

    if (campaign.type === "VIDEO_VIEW") {
      // For VIDEO_VIEW: targetChannelId is null. Use raw find + create to avoid
      // Prisma's typed compound-unique quirks with nulls.
      const existing = await prisma.taskCompletion.findFirst({
        where: {
          userId: u.user.id,
          campaignId: campaign.id,
          targetChannelId: null,
        },
      });
      if (existing) {
        await prisma.taskCompletion.update({
          where: { id: existing.id },
          data: { state: "VERIFIED", isAdminPreview: true, verifiedAt: new Date() },
        });
      } else {
        await prisma.taskCompletion.create({
          data: {
            userId: u.user.id,
            campaignId: campaign.id,
            targetChannelId: null,
            state: "VERIFIED",
            rewardCoins: 0,
            watchSeconds: 0,
            verifiedAt: new Date(),
            isAdminPreview: true,
          },
        });
      }
    } else {
      // For SUBSCRIBER campaigns, mark the target channel as previewed
      if (campaign.youtubeChannelId) {
        const existing = await prisma.taskCompletion.findFirst({
          where: {
            userId: u.user.id,
            targetChannelId: campaign.youtubeChannelId,
            state: "VERIFIED",
          },
        });
        if (!existing) {
          await prisma.taskCompletion.create({
            data: {
              userId: u.user.id,
              campaignId: campaign.id,
              targetChannelId: campaign.youtubeChannelId,
              state: "VERIFIED",
              rewardCoins: 0,
              verifiedAt: new Date(),
              isAdminPreview: true,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, campaignId: campaign.id });
  } catch (e) {
    return handleError(e);
  }
}
