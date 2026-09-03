import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateDailyQuest, incrementDailyQuest, getLevelInfo } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const u = await auth();
  if (!u?.user?.id) return null;

  const questDefs = [
    { questType: "WATCH_VIDEOS", label: "Watch 5 videos", targetCount: 5, rewardCoins: 50, rewardXp: 100 },
    { questType: "SUBSCRIBE_CHANNELS", label: "Subscribe to 2 channels", targetCount: 2, rewardCoins: 30, rewardXp: 60 },
    { questType: "SHARE_CAMPAIGN", label: "Share 1 campaign", targetCount: 1, rewardCoins: 20, rewardXp: 40 },
  ];

  const quests = await Promise.all(
    questDefs.map((def) => getOrCreateDailyQuest(u.user.id, def.questType, def.targetCount, def.rewardCoins, def.rewardXp))
  );

  const user = await prisma.user.findUnique({
    where: { id: u.user.id },
    select: { xp: true, level: true, dailyStreak: true },
  });

  const levelInfo = user ? getLevelInfo(user.xp) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daily Quests</h1>
        <p className="text-sm text-ink-500">Complete quests to earn bonus coins and XP. Resets daily.</p>
      </div>
      {levelInfo && (
        <div className="card p-4 flex items-center gap-3">
          <div className="text-sm text-ink-500">Level {levelInfo.level} · {levelInfo.title}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, ((levelInfo.xp % (levelInfo.xpForNext || 1000)) / (levelInfo.xpForNext || 1000)) * 100)}%` }} />
          </div>
          <div className="text-xs text-ink-500">{levelInfo.xpForNext > 0 ? `${levelInfo.xpForNext} XP to next level` : "Max level"}</div>
        </div>
      )}
      <div className="space-y-2">
        {quests.map((q) => {
          const def = questDefs.find((d) => d.questType === q.questType)!;
          const pct = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));
          return (
            <div key={q.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{def.label}</div>
                <div className="text-xs text-ink-500">{q.currentCount}/{q.targetCount}</div>
              </div>
              <div className="h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs text-ink-500">Reward: +{q.rewardCoins} coins · +{q.rewardXp} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
