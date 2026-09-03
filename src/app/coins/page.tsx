import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CoinsClient } from "@/components/coins-client";

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const u = await auth();
  if (!u?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: u.user.id }, select: { email: true } });
  const balance = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id }, _sum: { deltaCoins: true } });
  const settings = await getSettings();
  const recent = await prisma.payment.findMany({ where: { userId: u.user.id }, orderBy: { createdAt: "desc" }, take: 10 });
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Coins</h1>
        <p className="text-sm text-ink-500">Buy coins to boost your content. Coins are virtual credits used inside SUB2SUB.</p>
      </div>
      <CoinsClient
        userEmail={user?.email || ""}
        balance={balance._sum.deltaCoins ?? 0}
        packages={settings.coinPackages}
        recentPayments={recent.map((p) => ({
          id: p.id, coins: p.coins, amountCents: p.amountCents, currency: p.currency, status: p.status, createdAt: p.createdAt.toISOString(), provider: p.provider,
        }))}
      />
    </div>
  );
}
