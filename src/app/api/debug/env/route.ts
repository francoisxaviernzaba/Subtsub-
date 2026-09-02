import { NextResponse } from "next/server";

export async function GET() {
  // Dump raw process.env keys (no values) to see what's there
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes("GOOGLE") || k.includes("YOUTUBE") || k.includes("AUTH") ||
    k.includes("SECRET") || k.includes("SECRETS") || k.includes("TOKEN") ||
    k.includes("DATABASE") || k.includes("NEXTAUTH") || k.includes("VERCEL")
  );
  return NextResponse.json({
    envKeysPresent: envKeys.sort(),
    googleClientIdSet: !!process.env.GOOGLE_CLIENT_ID,
    googleClientIdLen: (process.env.GOOGLE_CLIENT_ID || "").length,
    secretsBlobSet: !!process.env.SECRETS_BLOB,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  });
}
