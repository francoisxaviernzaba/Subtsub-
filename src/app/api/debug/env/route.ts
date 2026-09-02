import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes("GOOGLE") || k.includes("YOUTUBE") || k.includes("AUTH") ||
    k.includes("SECRET") || k.includes("SECRETS") || k.includes("TOKEN") ||
    k.includes("DATABASE") || k.includes("NEXTAUTH") || k.includes("VERCEL")
  );
  return NextResponse.json({
    envKeysPresent: envKeys.sort(),
    googleClientId: process.env.GOOGLE_CLIENT_ID || "(empty)",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "(set " + process.env.GOOGLE_CLIENT_SECRET.length + " chars)" : "(empty)",
    youtubeApiKey: process.env.YOUTUBE_API_KEY || "(empty)",
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID || "(empty)",
    secretsBlobLen: (process.env.SECRETS_BLOB || "").length,
    secretsMasterKeyLen: (process.env.SECRETS_MASTER_KEY || "").length,
    tokenEncKey: process.env.TOKEN_ENC_KEY || "(empty)",
    adminEmails: process.env.ADMIN_EMAILS || "(empty)",
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    nexauthUrl: process.env.NEXTAUTH_URL,
  });
}
