import { google } from "googleapis";
import { prisma } from "./db";

const YT_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || "";
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "";
const YT_REDIRECT = process.env.YOUTUBE_REDIRECT_URI || "http://localhost:3000/api/youtube/callback";

export const YT_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

export function makeOAuth2Client() {
  return new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REDIRECT);
}

export function buildAuthUrl(state: string) {
  const oauth2 = makeOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: YT_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

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
  handle?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
};

export type YTVideo = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelId: string;
  channelTitle: string;
  publishedAt?: string;
  durationSec?: number;
  viewCount?: number;
  likeCount?: number;
};

export function parseChannelId(input: string): string | null {
  const trimmed = input.trim();
  if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/);
  if (m) return m[1];
  return null;
}

export function parseChannelHandle(input: string): string | null {
  const trimmed = input.trim();
  const m = trimmed.match(/(?:youtube\.com\/@|^@)([A-Za-z0-9._-]+)/);
  return m ? m[1] : null;
}

export function parseVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  let m = trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = trimmed.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = trimmed.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

function yt() {
  if (!YT_API_KEY) throw new Error("YOUTUBE_API_KEY is not configured");
  return google.youtube({ version: "v3", auth: YT_API_KEY });
}

export async function getChannelById(id: string): Promise<YTChannel | null> {
  return cached(`channel:${id}`, 6 * 60 * 60 * 1000, async () => {
    try {
      const res = await yt().channels.list({
        part: ["snippet", "statistics"],
        id: [id],
        maxResults: 1,
      });
      const item = res.data.items?.[0];
      if (!item) return null;
      return {
        id: item.id!,
        handle: item.snippet?.customUrl ?? undefined,
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? undefined,
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
        subscriberCount: item.statistics?.subscriberCount ? Number(item.statistics.subscriberCount) : undefined,
        videoCount: item.statistics?.videoCount ? Number(item.statistics.videoCount) : undefined,
      };
    } catch (e) {
      console.error("[youtube] getChannelById failed", e);
      return null;
    }
  });
}

export async function getChannelByHandle(handle: string): Promise<YTChannel | null> {
  const clean = handle.replace(/^@/, "");
  return cached(`channel:handle:${clean}`, 6 * 60 * 60 * 1000, async () => {
    try {
      const res = await yt().channels.list({
        part: ["snippet", "statistics"],
        forHandle: clean,
        maxResults: 1,
      });
      const item = res.data.items?.[0];
      if (!item) return null;
      return {
        id: item.id!,
        handle: item.snippet?.customUrl ?? clean,
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? undefined,
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
        subscriberCount: item.statistics?.subscriberCount ? Number(item.statistics.subscriberCount) : undefined,
        videoCount: item.statistics?.videoCount ? Number(item.statistics.videoCount) : undefined,
      };
    } catch (e) {
      console.error("[youtube] getChannelByHandle failed", e);
      return null;
    }
  });
}

export async function getVideoById(id: string): Promise<YTVideo | null> {
  return cached(`video:${id}`, 30 * 60 * 1000, async () => {
    try {
      const res = await yt().videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: [id],
        maxResults: 1,
      });
      const item = res.data.items?.[0];
      if (!item) return null;
      const dur = item.contentDetails?.duration;
      return {
        id: item.id!,
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? undefined,
        thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url,
        channelId: item.snippet?.channelId ?? "",
        channelTitle: item.snippet?.channelTitle ?? "",
        publishedAt: item.snippet?.publishedAt ?? undefined,
        durationSec: dur ? parseISO8601Duration(dur) : undefined,
        viewCount: item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined,
        likeCount: item.statistics?.likeCount ? Number(item.statistics.likeCount) : undefined,
      };
    } catch (e) {
      console.error("[youtube] getVideoById failed", e);
      return null;
    }
  });
}

function parseISO8601Duration(d: string): number {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1] || 0);
  const mm = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + mm * 60 + s;
}

/**
 * Check whether the user is subscribed to `targetChannelId` via their stored OAuth token.
 * Uses youtube.subscriptions.list (requires youtube.force-ssl scope).
 */
export async function checkSubscription(
  accessToken: string,
  targetChannelId: string,
): Promise<{ verified: boolean; reason?: string }> {
  if (!accessToken) return { verified: false, reason: "NO_SCOPE" };
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const ytAuth = google.youtube({ version: "v3", auth });
    let pageToken: string | undefined = undefined;
    do {
      const res = await ytAuth.subscriptions.list({
        part: ["snippet"],
        mine: true,
        maxResults: 50,
        pageToken,
      });
      const items = res.data.items ?? [];
      for (const sub of items) {
        if (sub.snippet?.resourceId?.channelId === targetChannelId) {
          return { verified: true };
        }
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
    return { verified: false, reason: "NOT_SUBSCRIBED" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[youtube] checkSubscription failed", msg);
    if (msg.includes("insufficient") || msg.includes("scope")) return { verified: false, reason: "NO_SCOPE" };
    if (msg.includes("401") || msg.includes("invalid")) return { verified: false, reason: "NO_SCOPE" };
    return { verified: false, reason: "API_ERROR" };
  }
}

export function ytThumbFromVideoId(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
