import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Coins, TrendingUp, TrendingDown, ShoppingCart, Users, Eye, CheckCircle2, Rocket } from "lucide-react";
import Link from "next/link";
import { InviteSection } from "@/components/invite-section";
import { formatHandle } from "@/lib/format-handle";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const u = await auth();
  if (!u?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: u.user.id } });
  const yt = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
  const balance = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id }, _sum: { deltaCoins: true } });
  const earned = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id, deltaCoins: { gt: 0 } }, _sum: { deltaCoins: true } });
  const spent = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id, deltaCoins: { lt: 0 } }, _sum: { deltaCoins: true } });
  const purchased = await prisma.coinTransaction.aggregate({ where: { userId: u.user.id, type: "COIN_PURCHASE" }, _sum: { deltaCoins: true } });
  const completedTasks = await prisma.taskCompletion.count({ where: { userId: u.user.id, state: "VERIFIED" } });
  const activeCampaigns = await prisma.campaign.count({ where: { ownerId: u.user.id, status: "ACTIVE" } });
  const completedCampaigns = await prisma.campaign.count({ where: { ownerId: u.user.id, status: { in: ["COMPLETED", "EXHAUSTED"] } } });

  const stats = [
    { label: "Balance", value: balance._sum.deltaCoins ?? 0, icon: Coins, color: "from-amber-400 to-orange-500" },
    { label: "Earned", value: earned._sum.deltaCoins ?? 0, icon: TrendingUp, color: "from-emerald-400 to-teal-500" },
    { label: "Spent", value: Math.abs(spent._sum.deltaCoins ?? 0), icon: TrendingDown, color: "from-rose-400 to-pink-500" },
    { label: "Purchased", value: purchased._sum.deltaCoins ?? 0, icon: ShoppingCart, color: "from-sky-400 to-indigo-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="size-20 rounded-2xl overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
          {user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{user?.name || "User"}</h1>
          <div className="text-sm text-ink-500">{user?.email}</div>
          {user?.username && <div className="text-xs text-ink-500">@{user.username}</div>}
          {yt && (
            <div className="mt-2 inline-flex items-center gap-2 chip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {yt.thumbnailUrl && <img src={yt.thumbnailUrl} alt="" className="size-4 rounded-full" />}
              Connected: {yt.title} {formatHandle(yt.handle) && <span className="text-ink-500">{formatHandle(yt.handle)}</span>}
            </div>
          )}
        </div>
        <Link href="/settings#youtube" className="btn btn-outline">Manage YouTube</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const I = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <div className={`inline-flex size-9 rounded-lg bg-gradient-to-br ${s.color} text-white items-center justify-center`}><I size={18} /></div>
              <div className="mt-2 text-xl font-extrabold">{s.value}</div>
              <div className="text-xs text-ink-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <InviteSection userId={u.user.id} />

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/transactions" className="card p-4 flex items-center gap-3 hover:shadow-soft">
          <CheckCircle2 className="text-emerald-500" />
          <div>
            <div className="font-semibold">{completedTasks} tasks</div>
            <div className="text-xs text-ink-500">View all completions</div>
          </div>
        </Link>
        <Link href="/boost" className="card p-4 flex items-center gap-3 hover:shadow-soft">
          <Rocket className="text-brand-500" />
          <div>
            <div className="font-semibold">{activeCampaigns} active</div>
            <div className="text-xs text-ink-500">Boost campaigns</div>
          </div>
        </Link>
        <div className="card p-4 flex items-center gap-3">
          <Eye className="text-ink-500" />
          <div>
            <div className="font-semibold">{completedCampaigns} completed</div>
            <div className="text-xs text-ink-500">Lifetime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
