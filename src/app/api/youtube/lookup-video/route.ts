import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { parseJson, handleError, HttpError } from "@/lib/api";
import { parseVideoId, getVideoById, ytThumbFromVideoId } from "@/lib/youtube";

const Body = z.object({ url: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const { url } = await parseJson(req, Body);
    const id = parseVideoId(url);
    if (!id) throw new HttpError(400, "BAD_URL", "Not a valid YouTube video URL");
    const v = await getVideoById(id);
    if (!v) throw new HttpError(404, "NOT_FOUND", "Video not found via YouTube API");
    return NextResponse.json({
      video: {
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnailUrl || ytThumbFromVideoId(v.id),
        channelTitle: v.channelTitle,
        channelId: v.channelId,
        durationSec: v.durationSec ?? 0,
        viewCount: v.viewCount,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
