import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getUserRank } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const board = await getLeaderboard(Math.min(limit, 100));
    return NextResponse.json({ leaderboard: board });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
