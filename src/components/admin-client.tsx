"use client";

import { useState, useEffect } from "react";
import { toast } from "./toast";
import { formatCoins, timeAgo } from "@/lib/utils";
import { formatHandle } from "@/lib/format-handle";
import { Coins, Users, Rocket, ShoppingCart, Settings as Cog, Mail, Shield, Trash2, Edit3, Plus, X, MessageSquare, Send } from "lucide-react";

type Settings = {
  viewRewardCoins: number; minWatchSeconds: number;
  subscribeRewardCoins: number;
  minBudget: number; maxBudget: number;
  minRewardPerAction: number; maxRewardPerAction: number;
  coinPackages: { coins: number; amountCents: number; currency: string }[];
  adminEmails: string[];
  enforceChannelPermanence: boolean;
  inviteRewardCoins: number;
  welcomeCoins: number;
};
type User = { id: string; email: string; name: string | null; role: string; status: string; createdAt: string; updatedAt: string; lastSeenAt: string | null; xp: number; level: number; dailyStreak: number; totalEarned: number; bio: string | null; publicProfile: boolean; yt: { title: string; handle: string | null; thumb: string | null; subscriberCount: number | null; verified: boolean } | null };
type Campaign = { id: string; ownerEmail: string; type: string; status: string; title: string; spent: number; budget: number; completed: number; max: number; createdAt: string };
type Payment = { id: string; userId: string; coins: number; amountCents: number; status: string; createdAt: string };
type SupportMessage = { id: string; userId: string; subject: string; message: string; status: string; priority: string; createdAt: string; updatedAt: string; resolvedAt: string | null; user: { id: string; name: string | null; email: string; image: string | null }; replies: { id: string; content: string; isAdmin: boolean; createdAt: string; user: { name: string | null; email: string } }[] };

export function AdminClient({ settings, users, campaigns, payments, totalCoins }: { settings: Settings; users: User[]; campaigns: Campaign[]; payments: Payment[]; totalCoins: number }) {
  const [tab, setTab] = useState<"overview" | "settings" | "users" | "campaigns" | "coins" | "support">("overview");
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);

  useEffect(() => {
    if (tab === "support") loadSupport();
  }, [tab]);

  async function loadSupport() {
    setSupportLoading(true);
    try {
      const r = await fetch("/api/admin/support");
      const j = await r.json();
      if (r.ok) setSupportMessages(j.items);
    } catch {}
    setSupportLoading(false);
  }

  async function replySupport(id: string, message: string) {
    const r = await fetch(`/api/admin/support/${id}/reply`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
    if (!r.ok) { toast({ title: "Reply failed", variant: "error" }); return; }
    toast({ title: "Reply sent", variant: "success" });
    loadSupport();
  }

  async function updateSupportStatus(id: string, status: string) {
    const r = await fetch(`/api/admin/support/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (!r.ok) { toast({ title: "Update failed", variant: "error" }); return; }
    toast({ title: "Status updated", variant: "success" });
    loadSupport();
  }

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
        <TabBtn active={tab === "support"} onClick={() => setTab("support")}>Support ({supportMessages.length})</TabBtn>
        <TabBtn active={tab === "coins"} onClick={() => setTab("coins")}>Coin management</TabBtn>
      </div>
      {tab === "overview" && <Overview users={users.length} campaigns={campaigns.length} payments={payments.length} totalCoins={totalCoins} />}
      {tab === "settings" && <SettingsForm initial={settings} />}
      {tab === "users" && <UsersManager users={users} />}
      {tab === "campaigns" && <CampaignsTable campaigns={campaigns} />}
      {tab === "support" && <SupportManager messages={supportMessages} loading={supportLoading} onReply={replySupport} onStatusChange={updateSupportStatus} />}
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
        <NumField label="Welcome coins (new signup)" value={s.welcomeCoins} onChange={(v) => setS({ ...s, welcomeCoins: v })} />
        <NumField label="Invite reward coins" value={s.inviteRewardCoins} onChange={(v) => setS({ ...s, inviteRewardCoins: v })} />
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Coin packages</div>
        {(s.coinPackages || []).map((pkg, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input type="number" className="input w-24" value={pkg.coins} onChange={(e) => {
              const next = [...s.coinPackages];
              next[idx] = { ...next[idx], coins: Number(e.target.value) };
              setS({ ...s, coinPackages: next });
            }} placeholder="Coins" />
            <input type="number" step="0.01" className="input w-28" value={Number((pkg.amountCents / 100).toFixed(2))} onChange={(e) => {
              const dollars = Number(e.target.value);
              if (!isFinite(dollars)) return;
              const cents = Math.round(dollars * 100);
              const next = [...s.coinPackages];
              next[idx] = { ...next[idx], amountCents: Math.max(100, cents) };
              setS({ ...s, coinPackages: next });
            }} placeholder="Price USD" />
            <input type="text" className="input w-20" value={pkg.currency} onChange={(e) => {
              const next = [...s.coinPackages];
              next[idx] = { ...next[idx], currency: e.target.value };
              setS({ ...s, coinPackages: next });
            }} placeholder="USD" />
            <button onClick={() => {
              const next = s.coinPackages.filter((_, i) => i !== idx);
              setS({ ...s, coinPackages: next });
            }} className="text-rose-600 text-xs">Remove</button>
          </div>
        ))}
        <button onClick={() => setS({ ...s, coinPackages: [...s.coinPackages, { coins: 0, amountCents: 100, currency: "USD" }] })} className="btn btn-outline h-8 px-2 text-xs">+ Add package</button>
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

function UsersManager({ users }: { users: User[] }) {
  const [list, setList] = useState<User[]>(users);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "USER", status: "ACTIVE", bio: "", publicProfile: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => { setList(users); }, [users]);

  async function loadUsers() {
    const r = await fetch("/api/admin/users");
    const j = await r.json();
    if (r.ok) setList(j.users);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", role: "USER", status: "ACTIVE", bio: "", publicProfile: false });
    setOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name || "", email: u.email, role: u.role, status: u.status, bio: u.bio || "", publicProfile: u.publicProfile });
    setOpen(true);
  }

  async function saveUser() {
    setBusy(true);
    const isEdit = !!editing;
    const url = isEdit ? `/api/admin/users/${editing!.id}` : "/api/admin/users";
    const method = isEdit ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (!r.ok) { toast({ title: isEdit ? "Update failed" : "Create failed", variant: "error" }); return; }
    toast({ title: isEdit ? "User updated" : "User created", variant: "success" });
    setOpen(false);
    loadUsers();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!r.ok) { toast({ title: "Delete failed", variant: "error" }); return; }
    toast({ title: "User deleted", variant: "success" });
    loadUsers();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{list.length} users</div>
        <button onClick={openCreate} className="btn btn-primary h-8 px-3 text-xs"><Plus size={14} /> Create user</button>
      </div>
      <div className="card divide-y divide-[rgb(var(--border))]">
        {list.map((u) => (
          <div key={u.id} className="p-3 flex items-center gap-3">
            <div className="size-9 rounded-full overflow-hidden bg-[rgb(var(--border))]">
              {u.yt?.thumb && <img src={u.yt.thumb} alt="" className="size-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{u.name || u.email}</div>
              <div className="text-xs text-ink-500 truncate">{u.email} · {u.role} · {u.status} · {timeAgo(u.createdAt)}</div>
            </div>
            <div className="text-xs text-ink-500">{u.yt ? (formatHandle(u.yt.handle) || u.yt.title) : "—"}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(u)} className="btn btn-outline h-7 px-2 text-xs"><Edit3 size={12} /></button>
              <button onClick={() => deleteUser(u.id)} className="btn btn-outline h-7 px-2 text-xs text-rose-600"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{editing ? "Edit user" : "Create user"}</div>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mt-1" disabled={!!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="select mt-1">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select mt-1">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="BANNED">BANNED</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input mt-1" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.publicProfile} onChange={(e) => setForm({ ...form, publicProfile: e.target.checked })} />
              Public profile
            </label>
            <div className="flex gap-2">
              <button disabled={busy} onClick={saveUser} className="btn btn-primary flex-1">{busy ? "Saving…" : "Save"}</button>
              <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupportManager({ messages, loading, onReply, onStatusChange }: { messages: SupportMessage[]; loading: boolean; onReply: (id: string, message: string) => void; onStatusChange: (id: string, status: string) => void }) {
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  async function sendReply(id: string) {
    if (!replyText.trim()) return;
    await onReply(id, replyText.trim());
    setReplyText("");
    setReplyId(null);
  }

  return (
    <div className="space-y-3">
      {loading ? <div className="text-sm text-ink-500">Loading…</div> : null}
      {!loading && messages.length === 0 && <div className="card p-6 text-center text-sm text-ink-500">No support messages yet.</div>}
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{m.subject}</div>
                <div className="text-xs text-ink-500">{m.user.email} · {timeAgo(m.createdAt)} · <span className="font-medium">{m.status}</span></div>
              </div>
              <select value={m.status} onChange={(e) => onStatusChange(m.id, e.target.value)} className="select h-7 text-xs">
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="text-sm text-ink-700 dark:text-ink-300 bg-[rgb(var(--border))]/40 p-3 rounded-lg">{m.message}</div>
            {m.replies.length > 0 && (
              <div className="space-y-2 pl-4 border-l-2 border-[rgb(var(--border))]">
                {m.replies.map((r) => (
                  <div key={r.id} className="text-sm">
                    <div className="text-xs text-ink-500 mb-0.5">{r.user.email} {r.isAdmin && <span className="text-brand-600 font-medium">(admin)</span>} · {timeAgo(r.createdAt)}</div>
                    <div className="text-ink-700 dark:text-ink-300">{r.content}</div>
                  </div>
                ))}
              </div>
            )}
            {replyId === m.id ? (
              <div className="flex gap-2">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} className="input flex-1" placeholder="Type a reply…" onKeyDown={(e) => e.key === "Enter" && sendReply(m.id)} />
                <button onClick={() => sendReply(m.id)} className="btn btn-primary h-9 px-3"><Send size={14} /></button>
                <button onClick={() => { setReplyId(null); setReplyText(""); }} className="btn btn-outline h-9 px-3"><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setReplyId(m.id)} className="btn btn-outline h-8 px-3 text-xs"><MessageSquare size={14} /> Reply</button>
            )}
          </div>
        ))}
      </div>
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
