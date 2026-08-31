import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { parseJson, handleError, HttpError } from "@/lib/api";
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
    if (!ch) throw new HttpError(404, "NOT_FOUND", "Channel not found via YouTube API");
    return NextResponse.json({ channel: ch });
  } catch (e) {
    return handleError(e);
  }
}
