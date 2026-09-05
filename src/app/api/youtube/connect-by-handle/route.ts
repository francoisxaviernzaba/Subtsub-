import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { z } from "zod";
import { parseChannelId, parseChannelHandle, getChannelById, getChannelByHandle } from "@/lib/youtube";

const Body = z.object({ url: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const { url } = await parseJson(req, Body);

    const id = parseChannelId(url);
    let ch = id ? await getChannelById(id) : null;
    if (!ch) {
      const handle = parseChannelHandle(url);
      if (handle) ch = await getChannelByHandle(handle);
    }
    if (!ch) throw new HttpError(404, "NOT_FOUND", "Channel not found. Enter a public YouTube handle or channel URL.");

    const existing = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (existing && existing.youtubeId !== ch.id) {
      throw new HttpError(409, "CHANNEL_LOCKED", "Your account is already linked to a different YouTube channel. This cannot be changed.");
    }

    await prisma.youTubeChannel.upsert({
      where: { userId: u.user.id },
      create: {
        userId: u.user.id,
        youtubeId: ch.id,
        handle: ch.handle,
        title: ch.title,
        thumbnailUrl: ch.thumbnailUrl,
        subscriberCount: ch.subscriberCount,
        verified: true,
        connectedAt: new Date(),
      },
      update: {
        youtubeId: ch.id,
        handle: ch.handle,
        title: ch.title,
        thumbnailUrl: ch.thumbnailUrl,
        subscriberCount: ch.subscriberCount,
        verified: true,
      },
    });

    return NextResponse.json({ channel: ch });
  } catch (e) {
    return handleError(e);
  }
}
