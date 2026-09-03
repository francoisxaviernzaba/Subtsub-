import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLeaderboard, getUserRank } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const u = await auth();
  const board = await getLeaderboard(100);
  const userRank = u?.user?.id ? await getUserRank(u.user.id) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-ink-500">Top creators ranked by XP. Update your profile to public to appear.</p>
      </div>
      {userRank && (
        <div className="card p-4 flex items-center gap-3">
          <div className="size-10 rounded-full bg-brand-50 text-brand-600 grid place-items-center font-extrabold">#{userRank}</div>
          <div>
            <div className="font-semibold">Your rank</div>
            <div className="text-xs text-ink-500">Keep earning XP to climb</div>
          </div>
        </div>
      )}
      <div className="card divide-y divide-[rgb(var(--border))]">
        {board.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">No users yet. Be the first!</div>
        ) : (
          board.map((entry) => (
            <div key={entry.id} className="p-3 flex items-center gap-3">
              <div className={`size-8 rounded-full grid place-items-center font-extrabold text-sm ${entry.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-[rgb(var(--border))] text-ink-500"}`}>
                {entry.rank}
              </div>
              <div className="size-8 rounded-full overflow-hidden bg-[rgb(var(--border))]">
                {entry.image ? <img src={entry.image} alt="" className="size-full object-cover" /> : <div className="size-full grid place-items-center text-xs">{(entry.name || "U")[0]?.toUpperCase()}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{entry.name || "Anonymous"}</div>
                <div className="text-xs text-ink-500">Level {entry.level} · {entry.xp.toLocaleString()} XP</div>
              </div>
              {entry.dailyStreak > 0 && <div className="text-xs">🔥{entry.dailyStreak}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
