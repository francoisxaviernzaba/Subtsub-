import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { rateLimit, getClientKey } from "@/lib/ratelimit";

const Query = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(["ALL", "VIDEO_VIEW", "SUBSCRIBER"]).default("ALL"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await auth();
    if (!user?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    if (!rateLimit(getClientKey(req, user.user.id), 60, 1)) throw new HttpError(429, "RATE_LIMIT", "Too many requests");

    const { searchParams } = new URL(req.url);
    const { cursor, take, type } = Query.parse({
      cursor: searchParams.get("cursor") || undefined,
      take: searchParams.get("take") || undefined,
      type: searchParams.get("type") || "ALL",
    });

    // VIDEO_VIEW campaigns + SUBSCRIBER campaigns: filter eligible + exclude user's own
    // and for subscribers exclude channels the user already completed.
    const completedSubs = await prisma.taskCompletion.findMany({
      where: { userId: user.user.id, state: { in: ["VERIFIED", "PENDING"] }, targetChannelId: { not: null } },
      select: { targetChannelId: true, state: true },
    });
    const completedChannelIds = new Set(completedSubs.map((c) => c.targetChannelId!).filter(Boolean));
    const completedViewCampaigns = await prisma.taskCompletion.findMany({
      where: { userId: user.user.id, state: { in: ["VERIFIED", "PENDING"] } },
      select: { campaignId: true, state: true },
    });
    const completedCampaignIds = new Set(completedViewCampaigns.map((c) => c.campaignId));
    const completedCampaignState = new Map(completedViewCampaigns.map((c) => [c.campaignId, c.state] as const));

    const now = new Date();
    const items = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        ownerId: { not: user.user.id },
        ...(type !== "ALL" ? { type } : {}),
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
        spentBudget: { lt: prisma.campaign.fields.totalBudget as unknown as any }, // placeholder
      },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true, image: true, youtubeChannel: { select: { thumbnailUrl: true, title: true, handle: true } } } } },
    }).catch(async () => {
      // fallback: simpler query (in case the raw field compare above fails on SQLite)
      return prisma.campaign.findMany({
        where: {
          status: "ACTIVE",
          ownerId: { not: user.user.id },
          ...(type !== "ALL" ? { type } : {}),
        },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true, image: true, youtubeChannel: { select: { thumbnailUrl: true, title: true, handle: true } } } } },
      });
    });

    // Filter: not exhausted, not completed
    const filtered = items
      .filter((c) => c.spentBudget < c.totalBudget)
      .filter((c) => {
        if (c.type === "SUBSCRIBER") return c.youtubeChannelId && !completedChannelIds.has(c.youtubeChannelId);
        return !completedCampaignIds.has(c.id);
      })
      .slice(0, take)
      .map((c) => {
        // userState tells the UI what state the campaign is in for THIS user
        let userState: "AVAILABLE" | "COMPLETED" | "PENDING" | "EXHAUSTED" | "PAUSED" = "AVAILABLE";
        if (c.status !== "ACTIVE") {
          userState = c.status === "PAUSED" ? "PAUSED" : "EXHAUSTED";
        } else if (c.spentBudget >= c.totalBudget) {
          userState = "EXHAUSTED";
        } else if (c.type === "SUBSCRIBER" && c.youtubeChannelId && completedChannelIds.has(c.youtubeChannelId)) {
          const comp = completedSubs.find((x) => x.targetChannelId === c.youtubeChannelId);
          userState = comp?.state === "PENDING" ? "PENDING" : "COMPLETED";
        } else if (completedCampaignIds.has(c.id)) {
          userState = completedCampaignState.get(c.id) === "PENDING" ? "PENDING" : "COMPLETED";
        }
        return { ...c, userState };
      });

    const nextCursor = items.length > take ? items[take].id : null;
    return NextResponse.json({ items: filtered, nextCursor });
  } catch (e) {
    return handleError(e);
  }
}
