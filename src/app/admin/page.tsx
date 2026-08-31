import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { AdminClient } from "@/components/admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const u = await auth();
  if (!u?.user?.id) redirect("/login");
  if (u.user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-sm text-ink-500 mt-2">Admins only.</p>
      </div>
    );
  }
  const settings = await getSettings();
  const [users, campaigns, payments, totalCoins] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { youtubeChannel: true } }),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { owner: { select: { name: true, email: true } } } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.coinTransaction.aggregate({ _sum: { deltaCoins: true } }),
  ]);
  return (
    <AdminClient
      settings={settings}
      users={users.map((x) => ({ id: x.id, email: x.email, name: x.name, role: x.role, status: x.status, createdAt: x.createdAt.toISOString(), yt: x.youtubeChannel ? { title: x.youtubeChannel.title, handle: x.youtubeChannel.handle, thumb: x.youtubeChannel.thumbnailUrl } : null }))}
      campaigns={campaigns.map((c) => ({ id: c.id, ownerEmail: c.owner.email, type: c.type, status: c.status, title: c.title, spent: c.spentBudget, budget: c.totalBudget, completed: c.completedActions, max: c.maxActions, createdAt: c.createdAt.toISOString() }))}
      payments={payments.map((p) => ({ id: p.id, userId: p.userId, coins: p.coins, amountCents: p.amountCents, status: p.status, createdAt: p.createdAt.toISOString() }))}
      totalCoins={totalCoins._sum.deltaCoins ?? 0}
    />
  );
}
