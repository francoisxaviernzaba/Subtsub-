import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/level-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const u = await auth();
  const user = await prisma.user.findFirst({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      publicProfile: true,
      xp: true,
      level: true,
      dailyStreak: true,
      totalEarned: true,
      createdAt: true,
      youtubeChannel: {
        select: { title: true, handle: true, thumbnailUrl: true, subscriberCount: true },
      },
    },
  });

  if (!user || !user.publicProfile) {
    notFound();
  }

  const campaigns = await prisma.campaign.count({
    where: { ownerId: user.id, status: "ACTIVE" },
  });

  const completions = await prisma.taskCompletion.count({
    where: { userId: user.id, state: "VERIFIED" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-full overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
            {user.image ? <img src={user.image} alt="" className="size-full object-cover" /> : <div className="size-full grid place-items-center text-2xl font-bold">{(user.name || "U")[0]?.toUpperCase()}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <LevelBadge xp={user.xp} size="sm" />
            </div>
            {user.bio && <p className="text-sm text-ink-500 mt-1">{user.bio}</p>}
            {user.youtubeChannel && (
              <div className="mt-2 flex items-center gap-2 chip">
                {user.youtubeChannel.thumbnailUrl && <img src={user.youtubeChannel.thumbnailUrl} alt="" className="size-4 rounded-full" />}
                {user.youtubeChannel.title}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center">
            <div className="text-lg font-extrabold">{user.level}</div>
            <div className="text-xs text-ink-500">Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold">{user.totalEarned.toLocaleString()}</div>
            <div className="text-xs text-ink-500">Coins Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold">{completions}</div>
            <div className="text-xs text-ink-500">Tasks Done</div>
          </div>
        </div>
      </div>
    </div>
  );
}
