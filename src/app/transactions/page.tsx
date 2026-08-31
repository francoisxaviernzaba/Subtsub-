import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCoins, timeAgo } from "@/lib/utils";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  VIEW_REWARD: "View reward",
  SUBSCRIBE_REWARD: "Subscribe reward",
  BOOST_SPEND: "Boost spend",
  BOOST_REFUND: "Boost refund",
  COIN_PURCHASE: "Coin purchase",
  ADMIN_ADJUSTMENT: "Admin adjustment",
  REFUND: "Refund",
  REVERSAL: "Reversal",
};

export default async function TransactionsPage() {
  const u = await auth();
  if (!u?.user?.id) return null;
  const txns = await prisma.coinTransaction.findMany({
    where: { userId: u.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const balance = txns[0]?.balanceAfter ?? 0;
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Transactions</h1>
        <p className="text-sm text-ink-500">Every coin movement is recorded and auditable.</p>
      </div>
      <div className="card p-4 flex items-center gap-2">
        <Coins className="text-amber-500" />
        <div className="text-sm text-ink-500">Current balance</div>
        <div className="ml-auto text-2xl font-extrabold">{formatCoins(balance)}</div>
      </div>
      <div className="card divide-y divide-[rgb(var(--border))]">
        {txns.length === 0 ? (
          <div className="p-8 text-center text-ink-500 text-sm">No transactions yet</div>
        ) : txns.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3">
            <div className={`size-9 rounded-lg grid place-items-center ${t.deltaCoins >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {t.deltaCoins >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{LABEL[t.type] || t.type}</div>
              <div className="text-xs text-ink-500 truncate">{t.note || "—"} · {timeAgo(t.createdAt)}</div>
            </div>
            <div className={`font-bold ${t.deltaCoins >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {t.deltaCoins >= 0 ? "+" : ""}{formatCoins(t.deltaCoins)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
