import { NextResponse } from "next/server";
import { applySecrets, getSecrets } from "@/lib/secrets";

export async function GET() {
  applySecrets();
  const s = getSecrets();
  return NextResponse.json({
    secretsBlobSet: !!process.env.SECRETS_BLOB,
    secretsMasterKeySet: !!process.env.SECRETS_MASTER_KEY,
    secretsMasterKeyLen: (process.env.SECRETS_MASTER_KEY || "").length,
    afterApply: {
      googleClientId: s.googleClientId ? s.googleClientId.slice(0, 12) + "..." : "(empty)",
      googleClientSecret: s.googleClientSecret ? "set (" + s.googleClientSecret.length + " chars)" : "(empty)",
      youtubeApiKey: s.youtubeApiKey ? s.youtubeApiKey.slice(0, 8) + "..." : "(empty)",
      youtubeClientId: s.youtubeClientId ? s.youtubeClientId.slice(0, 12) + "..." : "(empty)",
    },
    envAfter: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(0, 12) + "..." : "(empty)",
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.slice(0, 8) + "..." : "(empty)",
    },
  });
}
