import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { BoostClient } from "@/components/boost-client";

export const dynamic = "force-dynamic";

export default async function BoostPage() {
  const u = await auth();
  if (!u?.user?.id) return null;
  const yt = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
  const balance = await prisma.coinTransaction
    .aggregate({ where: { userId: u.user.id }, _sum: { deltaCoins: true } })
    .then((r) => r._sum.deltaCoins ?? 0);
  const settings = await getSettings();
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: u.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Boost</h1>
        <p className="text-sm text-ink-500">Create campaigns to promote your videos or channel. Spend coins to fill your budget.</p>
      </div>
      <BoostClient
        balance={balance}
        connected={!!yt}
        youtube={yt ? { id: yt.id, title: yt.title, handle: yt.handle, thumbnailUrl: yt.thumbnailUrl } : null}
        settings={settings}
        campaigns={campaigns.map((c) => ({
          id: c.id,
          type: c.type as "VIDEO_VIEW" | "SUBSCRIBER",
          status: c.status,
          title: c.title,
          rewardPerAction: c.rewardPerAction,
          totalBudget: c.totalBudget,
          spentBudget: c.spentBudget,
          maxActions: c.maxActions,
          completedActions: c.completedActions,
          createdAt: c.createdAt.toISOString(),
          youtubeVideoId: c.youtubeVideoId,
          youtubeChannelId: c.youtubeChannelId,
        }))}
      />
    </div>
  );
}
