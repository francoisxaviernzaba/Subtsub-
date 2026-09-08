import { google } from "googleapis";
import { prisma } from "./db";

const YT_API_KEY = process.env.YOUTUBE_API_KEY || "";

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = await prisma.youTubeCache.findUnique({ where: { key } });
  if (hit && hit.expiresAt.getTime() > now) {
    try {
      return JSON.parse(hit.payload) as T;
    } catch {
      /* fallthrough */
    }
  }
  const data = await loader();
  const expiresAt = new Date(now + ttlMs);
  await prisma.youTubeCache.upsert({
    where: { key },
    create: { key, payload: JSON.stringify(data), expiresAt },
    update: { payload: JSON.stringify(data), expiresAt },
  });
  return data;
}

export type YTChannel = {
  id: string;
  handle?: string | null;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  subscriberCount?: number | null;
  videoCount?: number | null;
  isPublic?: boolean;
};

export async function getChannelById(channelId: string): Promise<YTChannel | null> {
  if (!channelId || !YT_API_KEY) return null;
  try {
    const yt = google.youtube({ version: "v3", auth: YT_API_KEY });
    const res = await yt.channels.list({
      id: [channelId],
      part: ["snippet", "statistics", "contentDetails"],
      maxResults: 1,
    });
    const item = res.data.items?.[0];
    if (!item) return null;
    return {
      id: item.id || channelId,
      handle: null,
      title: item.snippet?.title || null,
      description: item.snippet?.description || null,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
      subscriberCount: item.statistics?.subscriberCount ? Number(item.statistics.subscriberCount) : null,
      videoCount: item.statistics?.videoCount ? Number(item.statistics.videoCount) : null,
      isPublic: true,
    };
  } catch (e) {
    console.error("[youtube] getChannelById failed", e);
    return null;
  }
}

export async function resolveChannelByHandle(handle: string): Promise<YTChannel | null> {
  const clean = handle.replace(/^@/, "").trim();
  if (!clean || !YT_API_KEY) return null;
  const cacheKey = `handle:${clean}`;
  return cached(cacheKey, 1000 * 60 * 60, async () => {
    try {
      const yt = google.youtube({ version: "v3", auth: YT_API_KEY });
      const res = await yt.search.list({
        q: clean,
        type: ["channel"],
        part: ["snippet"],
        maxResults: 1,
      });
      const item = res.data.items?.[0];
      if (!item?.snippet?.channelId) return null;
      return getChannelById(item.snippet.channelId);
    } catch (e) {
      console.error("[youtube] resolveChannelByHandle failed", e);
      return null;
    }
  });
}

export async function checkSubscriptionViaCreator(
  _auth: any,
  _authClientId: string | null,
  userChannelId: string,
  targetChannelId: string,
): Promise<{ verified: boolean; reason?: string }> {
  try {
    const [userCh, targetCh] = await Promise.all([
      getChannelById(userChannelId),
      getChannelById(targetChannelId),
    ]);
    if (!userCh) return { verified: false, reason: "USER_CHANNEL_NOT_FOUND" };
    if (!targetCh) return { verified: false, reason: "TARGET_CHANNEL_NOT_FOUND" };
    return { verified: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[youtube] public check failed", msg);
    return { verified: false, reason: "API_ERROR" };
  }
}

export function ytThumbFromVideoId(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
