"use client";

import { useState } from "react";
import { toast } from "./toast";
import { formatCoins, timeAgo } from "@/lib/utils";
import { Coins, Users, Rocket, ShoppingCart, Settings as Cog } from "lucide-react";

type Settings = {
  viewRewardCoins: number; minWatchSeconds: number;
  subscribeRewardCoins: number;
  minBudget: number; maxBudget: number;
  minRewardPerAction: number; maxRewardPerAction: number;
  coinPackages: { coins: number; amountCents: number; currency: string }[];
  adminEmails: string[];
  enforceChannelPermanence: boolean;
};
type User = { id: string; email: string; name: string | null; role: string; status: string; createdAt: string; yt: { title: string; handle: string | null; thumb: string | null } | null };
type Campaign = { id: string; ownerEmail: string; type: string; status: string; title: string; spent: number; budget: number; completed: number; max: number; createdAt: string };
type Payment = { id: string; userId: string; coins: number; amountCents: number; status: string; createdAt: string };

export function AdminClient({ settings, users, campaigns, payments, totalCoins }: { settings: Settings; users: User[]; campaigns: Campaign[]; payments: Payment[]; totalCoins: number }) {
  const [tab, setTab] = useState<"overview" | "settings" | "users" | "campaigns" | "coins">("overview");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="text-sm text-ink-500">Platform controls. Every action is logged.</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabBtn>
        <TabBtn active={tab === "settings"} onClick={() => setTab("settings")}>Settings</TabBtn>
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>Users ({users.length})</TabBtn>
        <TabBtn active={tab === "campaigns"} onClick={() => setTab("campaigns")}>Campaigns ({campaigns.length})</TabBtn>
        <TabBtn active={tab === "coins"} onClick={() => setTab("coins")}>Coin management</TabBtn>
      </div>
      {tab === "overview" && <Overview users={users.length} campaigns={campaigns.length} payments={payments.length} totalCoins={totalCoins} />}
      {tab === "settings" && <SettingsForm initial={settings} />}
      {tab === "users" && <UsersTable users={users} />}
      {tab === "campaigns" && <CampaignsTable campaigns={campaigns} />}
      {tab === "coins" && <CoinManager users={users} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`px-3 h-9 rounded-full text-sm font-medium border ${active ? "bg-brand-600 text-white border-brand-600" : "border-[rgb(var(--border))]"}`}>{children}</button>;
}

function Overview({ users, campaigns, payments, totalCoins }: { users: number; campaigns: number; payments: number; totalCoins: number }) {
  return (
    <div className="grid sm:grid-cols-4 gap-3">
      <KPI label="Users" value={users} icon={Users} />
      <KPI label="Campaigns" value={campaigns} icon={Rocket} />
      <KPI label="Payments" value={payments} icon={ShoppingCart} />
      <KPI label="Coins in circulation" value={formatCoins(totalCoins)} icon={Coins} />
    </div>
  );
}

function KPI({ label, value, icon: I }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="card p-4">
      <I className="text-brand-500" />
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}

function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const r = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(s) });
    setBusy(false);
    if (!r.ok) { toast({ title: "Save failed", variant: "error" }); return; }
    toast({ title: "Settings saved", variant: "success" });
  }
  return (
    <div className="card p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <NumField label="View reward (default)" value={s.viewRewardCoins} onChange={(v) => setS({ ...s, viewRewardCoins: v })} />
        <NumField label="Min watch seconds" value={s.minWatchSeconds} onChange={(v) => setS({ ...s, minWatchSeconds: v })} />
        <NumField label="Subscribe reward (default)" value={s.subscribeRewardCoins} onChange={(v) => setS({ ...s, subscribeRewardCoins: v })} />
        <NumField label="Min budget" value={s.minBudget} onChange={(v) => setS({ ...s, minBudget: v })} />
        <NumField label="Max budget" value={s.maxBudget} onChange={(v) => setS({ ...s, maxBudget: v })} />
        <NumField label="Min reward/action" value={s.minRewardPerAction} onChange={(v) => setS({ ...s, minRewardPerAction: v })} />
        <NumField label="Max reward/action" value={s.maxRewardPerAction} onChange={(v) => setS({ ...s, maxRewardPerAction: v })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.enforceChannelPermanence} onChange={(e) => setS({ ...s, enforceChannelPermanence: e.target.checked })} />
        Enforce permanent YouTube channel binding
      </label>
      <button onClick={save} disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save settings"}</button>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="input mt-1" />
    </div>
  );
}

function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="card divide-y divide-[rgb(var(--border))]">
      {users.map((u) => (
        <div key={u.id} className="p-3 flex items-center gap-3">
          <div className="size-9 rounded-full overflow-hidden bg-[rgb(var(--border))]">
            {u.yt?.thumb && <img src={u.yt.thumb} alt="" className="size-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{u.name || u.email}</div>
            <div className="text-xs text-ink-500 truncate">{u.email} · {u.role} · {u.status} · {timeAgo(u.createdAt)}</div>
          </div>
          <div className="text-xs text-ink-500">{u.yt ? `@${u.yt.handle || u.yt.title}` : "—"}</div>
        </div>
      ))}
    </div>
  );
}

function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  async function preview(id: string) {
    setBusyId(id);
    const r = await fetch("/api/admin/preview-campaign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ campaignId: id }) });
    setBusyId(null);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast({ title: "Preview failed", description: j?.error?.message, variant: "error" });
      return;
    }
    toast({ title: "Marked as previewed", description: "View-only — no coins credited, no budget counted.", variant: "success" });
  }
  return (
    <div className="card divide-y divide-[rgb(var(--border))]">
      {campaigns.map((c) => (
        <div key={c.id} className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{c.title}</div>
              <div className="text-xs text-ink-500">{c.ownerEmail} · {c.type} · {c.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs">{c.completed}/{c.max} · {c.spent}/{c.budget} 🪙</div>
              <button
                onClick={() => preview(c.id)}
                disabled={busyId === c.id}
                className="btn btn-outline h-7 px-2 text-xs"
                title="Mark as viewed by admin (no reward, no budget counted)"
              >
                {busyId === c.id ? "…" : "View"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoinManager({ users }: { users: User[] }) {
  const [userId, setUserId] = useState(users[0]?.id || "");
  const [amount, setAmount] = useState(100);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function adjust(sign: 1 | -1) {
    if (!userId) return;
    setBusy(true);
    const r = await fetch("/api/admin/coins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId, amount: sign * Math.abs(amount), note }) });
    setBusy(false);
    if (!r.ok) { toast({ title: "Failed", variant: "error" }); return; }
    toast({ title: `Adjusted ${sign > 0 ? "+" : "-"}${amount}`, variant: "success" });
  }
  return (
    <div className="card p-5 space-y-3">
      <div>
        <label className="text-sm font-medium">User</label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="select mt-1">
          {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Note (audit log)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="input mt-1" />
      </div>
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => adjust(1)} className="btn btn-primary">+ Add</button>
        <button disabled={busy} onClick={() => adjust(-1)} className="btn btn-outline">- Remove</button>
      </div>
    </div>
  );
}
