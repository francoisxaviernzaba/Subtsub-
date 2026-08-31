import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { S2SGrid } from "@/components/s2s-grid";

export const dynamic = "force-dynamic";

export default async function S2SPage() {
  const user = await auth();
  if (!user?.user?.id) return null;
  // Pre-fetch first page
  const completed = await prisma.taskCompletion.findMany({
    where: { userId: user.user.id, targetChannelId: { not: null } },
    select: { targetChannelId: true },
  });
  const excluded = new Set(completed.map((c) => c.targetChannelId!).filter(Boolean));
  const items = await prisma.campaign.findMany({
    where: {
      type: "SUBSCRIBER",
      status: "ACTIVE",
      ownerId: { not: user.user.id },
    },
    take: 30,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, image: true, youtubeChannel: { select: { title: true, handle: true, thumbnailUrl: true } } } } },
  });
  const filtered = items
    .filter((c) => c.spentBudget < c.totalBudget)
    .filter((c) => !!c.youtubeChannelId && !excluded.has(c.youtubeChannelId!)) as typeof items;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">S2S — Subscribe to Earn</h1>
        <p className="text-sm text-ink-500">Subscribe to channels using your verified YouTube account. You can only earn once per channel.</p>
      </div>
      <S2SGrid initial={filtered} />
    </div>
  );
}
