import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateDailyQuest, incrementDailyQuest, getLevelInfo } from "@/lib/gamification";
import { handleError, HttpError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");

    const user = await prisma.user.findUnique({
      where: { id: u.user.id },
      select: { xp: true, level: true, dailyStreak: true, lastStreakAt: true },
    });
    if (!user) throw new HttpError(404, "NOT_FOUND", "User not found");

    const quests = await prisma.dailyQuest.findMany({
      where: { userId: u.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const levelInfo = getLevelInfo(user.xp);

    return NextResponse.json({
      xp: user.xp,
      level: user.level,
      dailyStreak: user.dailyStreak,
      lastStreakAt: user.lastStreakAt,
      levelInfo,
      quests,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const body = await req.json().catch(() => null);
    if (!body?.questType) throw new HttpError(400, "BAD_REQUEST", "questType required");

    const quest = await incrementDailyQuest(u.user.id, body.questType);
    return NextResponse.json(quest);
  } catch (e) {
    return handleError(e);
  }
}
