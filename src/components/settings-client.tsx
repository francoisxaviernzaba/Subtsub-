"use client";

import { useState } from "react";
import { Youtube, AlertTriangle, CheckCircle2, Lock, Bell, User as UserIcon, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "./toast";
import { useRouter } from "next/navigation";
import { formatHandle } from "@/lib/format-handle";

type User = { name: string; email: string; username: string };
type YT = { title: string; handle: string | null; thumbnailUrl: string | null; verified: boolean; connectedAt: string } | null;

export function SettingsClient({ user, youtube, ytStatus, ytMessage }: { user: User; youtube: YT; ytStatus?: string; ytMessage?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"account" | "notifications" | "security" | "youtube">("account");

  function YouTubePanelInner() {
    const [handle, setHandle] = useState("");
    const [busy, setBusy] = useState(false);

    async function connect() {
      if (!handle.trim()) return;
      setBusy(true);
      try {
        const r = await fetch("/api/youtube/connect-by-handle", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: handle.trim() }),
        });
        const j = await r.json();
        if (!r.ok) { toast({ title: "Connection failed", description: j?.error?.message, variant: "error" }); return; }
        toast({ title: "Channel connected", variant: "success" });
        router.refresh();
      } catch {
        toast({ title: "Connection failed", variant: "error" });
      } finally {
        setBusy(false);
      }
    }

    return (
      <div className="card p-5 space-y-4">
        {ytStatus === "ok" && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> YouTube channel connected.</div>}
        {ytStatus === "err" && <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm flex items-center gap-2"><AlertTriangle size={16} /> {ytMessage || "Connection failed"}.</div>}

        {youtube ? (
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full overflow-hidden bg-[rgb(var(--border))]">
              {youtube.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={youtube.thumbnailUrl} alt="" className="size-full object-cover" />
              )}
            </div>
            <div>
              <div className="font-semibold">{youtube.title}</div>
              {formatHandle(youtube.handle) && <div className="text-sm text-ink-500">{formatHandle(youtube.handle)}</div>}
              <div className="text-[11px] text-ink-500">Connected {new Date(youtube.connectedAt).toLocaleDateString()}</div>
            </div>
            <a href={`https://www.youtube.com/channel/${youtube.handle || ""}`} target="_blank" rel="noopener noreferrer" className="ml-auto btn btn-outline"><ExternalLink size={14} /> View</a>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="font-semibold">Connect your YouTube channel</div>
              <div className="text-sm text-ink-500">Enter your public YouTube channel handle or URL. Your channel must be public for subscription verification to work.</div>
            </div>
            <div className="flex gap-2">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@channelname or https://youtube.com/@channelname"
                className="input flex-1"
                onKeyDown={(e) => e.key === "Enter" && connect()}
              />
              <button onClick={connect} disabled={busy || !handle.trim()} className="btn btn-primary">
                {busy ? <span className="animate-spin">⟳</span> : <><LinkIcon size={14} /> Connect</>}
              </button>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm flex gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Keep your channel public and subscriptions visible</div>
            <div className="text-xs">Subscription verification requires your channel and subscriptions to be public. If verification fails, visit your <a href="https://www.youtube.com/account_privacy" target="_blank" rel="noopener noreferrer" className="underline">YouTube Privacy Settings</a> and turn off &quot;Keep all my subscriptions private.&quot;</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-6">
      <nav className="card p-2 h-fit">
        <TabBtn active={tab === "account"} onClick={() => setTab("account")}><UserIcon size={14} /> Account</TabBtn>
        <TabBtn active={tab === "notifications"} onClick={() => setTab("notifications")}><Bell size={14} /> Notifications</TabBtn>
        <TabBtn active={tab === "security"} onClick={() => setTab("security")}><Lock size={14} /> Security</TabBtn>
        <TabBtn active={tab === "youtube"} onClick={() => setTab("youtube")}><Youtube size={14} /> YouTube</TabBtn>
      </nav>
      <div className="space-y-4">
        {tab === "account" && <AccountForm user={user} onSaved={() => router.refresh()} />}
        {tab === "notifications" && <NotificationSettings />}
        {tab === "security" && <SecurityPanel />}
        {tab === "youtube" && <YouTubePanelInner />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${active ? "bg-[rgb(var(--border))]/70" : "hover:bg-[rgb(var(--border))]/40"}`}>
      {children}
    </button>
  );
}

function AccountForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const r = await fetch("/api/me", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, username }) });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast({ title: "Save failed", description: j?.error?.message, variant: "error" });
      return;
    }
    toast({ title: "Saved", variant: "success" });
    onSaved();
  }

  return (
    <div className="card p-5 space-y-3">
      <div>
        <label className="text-sm font-medium">Email</label>
        <input value={user.email} disabled className="input mt-1 opacity-70" />
        <div className="text-[11px] text-ink-500 mt-1">Email is tied to your Google account</div>
      </div>
      <div>
        <label className="text-sm font-medium">Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="input mt-1" />
      </div>
      <button onClick={save} disabled={busy} className="btn btn-primary">Save</button>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({ rewards: true, campaigns: true, account: true });
  function toggle(k: keyof typeof prefs) { setPrefs((p) => ({ ...p, [k]: !p[k] })); }
  return (
    <div className="card p-5 space-y-3">
      <Toggle label="Reward notifications" desc="When you earn coins from verified tasks" value={prefs.rewards} onChange={() => toggle("rewards")} />
      <Toggle label="Campaign updates" desc="Activations, completion, budget alerts" value={prefs.campaigns} onChange={() => toggle("campaigns")} />
      <Toggle label="Account events" desc="YouTube connection, security" value={prefs.account} onChange={() => toggle("account")} />
      <div className="text-[11px] text-ink-500">Preferences are stored locally for now; full backend persistence coming soon.</div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
      <button onClick={onChange} className={`w-11 h-6 rounded-full transition relative ${value ? "bg-brand-600" : "bg-[rgb(var(--border))]"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="card p-5 space-y-3">
      <div className="text-sm">
        You are signed in with Google. Account security (password, 2FA) is managed by your Google account.
      </div>
      <ul className="text-sm text-ink-500 list-disc pl-5 space-y-1">
        <li>All sensitive actions require a valid Google session.</li>
        <li>YouTube channel connection is permanent and cannot be changed to bypass rewards.</li>
        <li>Coin balances are computed server-side from the ledger.</li>
      </ul>
    </div>
  );
}
