import { google } from "googleapis";
import { prisma } from "./db";
import { encryptToken } from "./crypto";

export async function autoConnectYouTubeChannel(
  userId: string,
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken ?? undefined });

    const yt = google.youtube({ version: "v3", auth });

    // Get the channels owned by this authenticated user (requires youtube.readonly)
    const ch = await yt.channels.list({
      part: ["id", "snippet", "statistics"],
      mine: true,
      maxResults: 1,
    });

    const item = ch.data.items?.[0];
    if (!item?.id) return;

    const ytChannelId = item.id;
    const ytTitle = item.snippet?.title || "YouTube channel";
    const ytHandle = item.snippet?.customUrl || null;
    const ytThumb = item.snippet?.thumbnails?.default?.url || null;
    const subCount = item.statistics?.subscriberCount ? Number(item.statistics.subscriberCount) : null;
    const videoCount = item.statistics?.videoCount ? Number(item.statistics.videoCount) : null;

    // Check if this channel is already linked to another user
    const existingChannel = await prisma.youTubeChannel.findUnique({ where: { youtubeId: ytChannelId } });
    if (existingChannel && existingChannel.userId !== userId) {
      // Channel already connected to a different user — skip silently during auto-connect
      return;
    }

    // Check if user already has a different channel linked
    const existingUserChannel = await prisma.youTubeChannel.findUnique({ where: { userId } });
    if (existingUserChannel && existingUserChannel.youtubeId !== ytChannelId) {
      // User already has a different channel — skip (don't override)
      return;
    }

    // Upsert the channel record
    await prisma.youTubeChannel.upsert({
      where: { userId },
      create: {
        userId,
        youtubeId: ytChannelId,
        handle: ytHandle,
        title: ytTitle,
        thumbnailUrl: ytThumb,
        subscriberCount: subCount,
        videoCount: videoCount,
        verified: true,
        verifiedAt: new Date(),
        accessTokenCipher: accessToken ? encryptToken(accessToken) : null,
        refreshTokenCipher: refreshToken ? encryptToken(refreshToken) : null,
      },
      update: {
        youtubeId: ytChannelId,
        handle: ytHandle,
        title: ytTitle,
        thumbnailUrl: ytThumb,
        subscriberCount: subCount,
        videoCount: videoCount,
        verified: true,
        verifiedAt: new Date(),
        accessTokenCipher: accessToken ? encryptToken(accessToken) : null,
        refreshTokenCipher: refreshToken ? encryptToken(refreshToken) : null,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        kind: "YT_CONNECTION",
        title: "YouTube channel auto-connected",
        body: `@${ytHandle || ytTitle} is now linked to your account.`,
        link: "/settings#youtube",
      },
    });
  } catch (e) {
    console.error("[youtube-auto-connect] failed:", e);
    // Silent fail — auto-connect is best-effort, user can always connect manually
  }
}
