import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, HttpError } from "@/lib/api";
import { parseChannelId, parseChannelHandle, getChannelById, getChannelByHandle } from "@/lib/youtube";

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");

    const body = await req.json().catch(() => null);
    const input = body?.channel?.trim();
    if (!input) throw new HttpError(400, "NO_INPUT", "Please provide a YouTube channel handle or URL");

    let channelId: string | null = null;
    let channelData = null;

    const id = parseChannelId(input);
    if (id) {
      channelId = id;
      channelData = await getChannelById(id);
    }

    if (!channelData) {
      const handle = parseChannelHandle(input);
      if (handle) {
        channelData = await getChannelByHandle(handle);
        if (channelData) channelId = channelData.id;
      }
    }

    if (!channelData || !channelId) {
      throw new HttpError(404, "NOT_FOUND", "Channel not found. Please check the handle or URL and try again.");
    }

    const existingForChannel = await prisma.youTubeChannel.findUnique({ where: { youtubeId: channelId } });
    if (existingForChannel && existingForChannel.userId !== u.user.id) {
      throw new HttpError(409, "CHANNEL_TAKEN", "This YouTube channel is already connected to another account");
    }

    const existingForUser = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (existingForUser && existingForUser.youtubeId !== channelId) {
      throw new HttpError(409, "CHANNEL_LOCKED", "Your account is already linked to a different YouTube channel. Channel connection is permanent.");
    }

    await prisma.youTubeChannel.upsert({
      where: { userId: u.user.id },
      create: {
        userId: u.user.id,
        youtubeId: channelId,
        handle: channelData.handle ?? null,
        title: channelData.title,
        description: channelData.description ?? null,
        thumbnailUrl: channelData.thumbnailUrl ?? null,
        subscriberCount: channelData.subscriberCount ?? null,
        videoCount: channelData.videoCount ?? null,
        verified: true,
        verifiedAt: new Date(),
      },
      update: {
        youtubeId: channelId,
        handle: channelData.handle ?? null,
        title: channelData.title,
        description: channelData.description ?? null,
        thumbnailUrl: channelData.thumbnailUrl ?? null,
        subscriberCount: channelData.subscriberCount ?? null,
        videoCount: channelData.videoCount ?? null,
        verified: true,
        verifiedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: u.user.id,
        kind: "YT_CONNECTION",
        title: "YouTube channel connected",
        body: `@${channelData.handle || channelData.title} is now linked to your account.`,
        link: "/settings#youtube",
      },
    });

    return NextResponse.json({ ok: true, channel: { title: channelData.title, handle: channelData.handle, id: channelId } });
  } catch (e) {
    return handleError(e);
  }
}
