import { prisma } from "@/lib/db";

export type LevelInfo = {
  level: number;
  xp: number;
  xpForNext: number;
  title: string;
};

const LEVEL_TITLES = [
  "Beginner", "Learner", "Explorer", "Creator", "Influencer",
  "Master", "Expert", "Legend", "Titan", "Godlike",
];

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let accumulated = 0;
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
      accumulated = thresholds[i];
    } else {
      break;
    }
  }
  const xpForNext = level < thresholds.length ? thresholds[level] - accumulated : 0;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, xp, xpForNext, title };
}

export async function addXp(userId: string, amount: number, source: string) {
  if (amount <= 0) return;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount }, totalEarned: { increment: amount } },
    select: { xp: true, level: true, dailyStreak: true, lastStreakAt: true },
  });

  const info = getLevelInfo(user.xp);
  if (info.level > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: info.level },
    });
    await prisma.notification.create({
      data: {
        userId,
        kind: "ACCOUNT_EVENT",
        title: `Level up! You're now Level ${info.level}`,
        body: `You reached "${info.title}" rank. Keep earning!`,
        link: "/profile",
      },
    }).catch(() => {});
  }
}

export async function updateDailyStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastStreakAt: true, dailyStreak: true },
  });
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = user.lastStreakAt ? new Date(user.lastStreakAt.getFullYear(), user.lastStreakAt.getMonth(), user.lastStreakAt.getDate()) : null;

  if (last && last.getTime() === today.getTime()) {
    return; // already updated today
  }

  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayWasActive = last && last.getTime() === yesterday.getTime();

  let newStreak = user.dailyStreak;
  if (yesterdayWasActive) {
    newStreak += 1;
  } else if (!last || last.getTime() < yesterday.getTime()) {
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dailyStreak: newStreak, lastStreakAt: now },
  });

  // Milestone bonuses
  if (newStreak === 7) {
    await prisma.coinTransaction.create({
      data: {
        userId,
        deltaCoins: 200,
        balanceAfter: 0,
        type: "ADMIN_ADJUSTMENT",
        note: "7-day streak bonus",
        idempotencyKey: `streak.${userId}.7`,
      },
    }).catch(() => {});
  } else if (newStreak === 30) {
    await prisma.coinTransaction.create({
      data: {
        userId,
        deltaCoins: 1000,
        balanceAfter: 0,
        type: "ADMIN_ADJUSTMENT",
        note: "30-day streak bonus",
        idempotencyKey: `streak.${userId}.30`,
      },
    }).catch(() => {});
  }
}

export async function getOrCreateDailyQuest(userId: string, questType: string, targetCount: number, rewardCoins: number, rewardXp: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const quest = await prisma.dailyQuest.findUnique({
    where: { userId_questType_date: { userId, questType, date } },
  });
  if (!quest) {
    return await prisma.dailyQuest.create({
      data: {
        userId,
        questType,
        targetCount,
        rewardCoins,
        rewardXp,
        date,
      },
    });
  }
  return quest;
}

export async function incrementDailyQuest(userId: string, questType: string) {
  const quest = await getOrCreateDailyQuest(userId, questType, 0, 0, 0);
  if (quest.completed) return quest;

  const updated = await prisma.dailyQuest.update({
    where: { id: quest.id },
    data: { currentCount: { increment: 1 } },
  });

  if (updated.currentCount >= updated.targetCount && !quest.completed) {
    await prisma.dailyQuest.update({
      where: { id: quest.id },
      data: { completed: true },
    });
    // Credit rewards
    await prisma.coinTransaction.create({
      data: {
        userId,
        deltaCoins: updated.rewardCoins,
        balanceAfter: 0,
        type: "ADMIN_ADJUSTMENT",
        note: `Daily quest bonus: ${questType}`,
        idempotencyKey: `quest.${quest.id}`,
      },
    }).catch(() => {});
    await addXp(userId, updated.rewardXp, "daily_quest");
    await prisma.notification.create({
      data: {
        userId,
        kind: "COIN_PURCHASE",
        title: `+${updated.rewardCoins} coins`,
        body: `Daily quest completed: ${questType}`,
        link: "/quests",
      },
    }).catch(() => {});
  }

  return updated;
}

export async function getLeaderboard(limit = 100) {
  const users = await prisma.user.findMany({
    where: { publicProfile: true },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      level: true,
      dailyStreak: true,
      totalEarned: true,
    },
    orderBy: { xp: "desc" },
    take: limit,
  });
  return users.map((u, i) => ({ ...u, rank: i + 1 }));
}

export async function getUserRank(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });
  if (!user) return null;
  const count = await prisma.user.count({
    where: { xp: { gt: user.xp }, publicProfile: true },
  });
  return count + 1;
}
