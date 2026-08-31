import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/youtube";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const state = crypto.randomBytes(16).toString("hex");
    const url = buildAuthUrl(state);
    const res = NextResponse.redirect(url);
    // state cookie
    res.cookies.set("yt_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (e) {
    return handleError(e);
  }
}
