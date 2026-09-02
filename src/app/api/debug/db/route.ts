import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applySecrets } from "@/lib/secrets";

applySecrets();

export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const dbUrlPreview = process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 30) + "..." : "(empty)";
  let dbWorks = false;
  let dbError = "";
  if (hasDatabaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      dbWorks = true;
    } catch (e: any) {
      dbError = e.message.slice(0, 200);
    }
  }
  return NextResponse.json({
    databaseUrlSet: hasDatabaseUrl,
    databaseUrl: dbUrlPreview,
    dbQueryWorks: dbWorks,
    dbError,
  });
}
