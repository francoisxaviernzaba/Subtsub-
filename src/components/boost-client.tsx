"use client";

import { useEffect, useState } from "react";
import { Coins, Eye, Users, Pause, Play, Trash2, Youtube, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "./toast";
import { formatCoins, formatNumber, timeAgo } from "@/lib/utils";

type YT = { id: string; title: string; handle: string | null; thumbnailUrl: string | null } | null;
type Campaign = {
  id: string; type: "VIDEO_VIEW" | "SUBSCRIBER"; status: string; title: string;
  rewardPerAction: number; totalBudget: number; spentBudget: number; maxActions: number; completedActions: number;
  createdAt: string; youtubeVideoId: string | null; youtubeChannelId: string | null;
};
type Settings = {
  viewRewardCoins: number; minWatchSeconds: number; subscribeRewardCoins: number;
  minBudget: number; maxBudget: number; minRewardPerAction: number; maxRewardPerAction: number;
  coinPackages: { coins: number; amountCents: number; currency: string }[];
  adminEmails: string[];
  enforceChannelPermanence: boolean;
};

export function BoostClient({ balance, connected, youtube, settings, campaigns }: { balance: number; connected: boolean; youtube: YT; settings: Settings; campaigns: Campaign[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"VIDEO_VIEW" | "SUBSCRIBER">("VIDEO_VIEW");

  if (!connected) {
    return (
      <div className="card p-8 text-center">
        <Youtube className="mx-auto" size={32} />
        <h3 className="mt-3 font-semibold text-lg">Connect your YouTube channel first</h3>
        <p className="text-sm text-ink-500 mt-1">To create boost campaigns, you must verify ownership of a YouTube channel.</p>
        <Link href="/settings#youtube" className="btn btn-primary mt-4 inline-flex">Connect YouTube</Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card p-4 sm:p-5">
        <div className="flex gap-1 p-1 bg-[rgb(var(--border))]/40 rounded-xl w-fit">
          <TabBtn active={tab === "VIDEO_VIEW"} onClick={() => setTab("VIDEO_VIEW")}><Eye size={14} /> Video boost</TabBtn>
          <TabBtn active={tab === "SUBSCRIBER"} onClick={() => setTab("SUBSCRIBER")}><Users size={14} /> Subscriber boost</TabBtn>
        </div>
        <div className="mt-5">
          {tab === "VIDEO_VIEW" ? <VideoWizard settings={settings} balance={balance} /> : <SubscriberWizard settings={settings} balance={balance} youtube={youtube} />}
        </div>
      </div>
      <div className="space-y-3">
        <div className="card p-4">
          <div className="text-sm text-ink-500">Your balance</div>
          <div className="text-2xl font-extrabold flex items-center gap-1.5"><Coins size={20} className="text-amber-500" /> {formatCoins(balance)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">Your campaigns</div>
          {campaigns.length === 0 ? (
            <div className="text-sm text-ink-500">No campaigns yet</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto scroll-thin">
              {campaigns.map((c) => <CampaignRow key={c.id} c={c} onChange={() => router.refresh()} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 h-9 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${active ? "bg-white shadow-soft text-ink-900" : "text-ink-500"}`}>
      {children}
    </button>
  );
}

function VideoWizard({ settings, balance }: { settings: Settings; balance: number }) {
  const [url, setUrl] = useState("");
  const [views, setViews] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{ id: string; title: string; thumbnail: string; channelTitle: string; durationSec: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Coin cost is fixed by admin (settings.viewRewardCoins per view)
  const reward = settings.viewRewardCoins;
  const budget = views * reward;

  async function lookup() {
    setErr(null); setPreview(null);
    if (!url) { setErr("Paste a YouTube video URL"); return; }
    const r = await fetch("/api/youtube/lookup-video", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
    const j = await r.json();
    if (!r.ok) { setErr(j?.error?.message || "Invalid URL"); return; }
    setPreview(j.video);
  }

  async function submit() {
    setSubmitting(true); setErr(null);
    try {
      const r = await fetch("/api/campaigns/video", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, views }),
      });
      const j = await r.json();
      if (!r.ok) {
        const msg = j?.error?.message || "Failed";
        if (j?.error?.code === "DUPLICATE_CAMPAIGN") {
          toast({ title: "Campaign already exists", description: msg, variant: "error" });
        }
        setErr(msg);
        return;
      }
      toast({ title: "Campaign created", description: "Your video is now in the discovery feed.", variant: "success" });
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  const valid = url && views >= 1 && views <= 1_000_000 && budget >= settings.minBudget && budget <= settings.maxBudget && budget <= balance && preview;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">YouTube video URL</label>
        <div className="mt-1 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="input" />
          <button onClick={lookup} className="btn btn-outline">Lookup</button>
        </div>
      </div>
      {preview && (
        <div className="card p-3 flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.thumbnail} alt="" className="w-32 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold line-clamp-2">{preview.title}</div>
            <div className="text-xs text-ink-500 mt-1">{preview.channelTitle} · {Math.round(preview.durationSec / 60)}m</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">✓ Video verified via YouTube API</div>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">How many views do you want?</label>
        <input
          type="number"
          min={1}
          value={views}
          onChange={(e) => setViews(Math.max(1, Number(e.target.value) || 0))}
          className="input mt-1"
        />
        <div className="text-[11px] text-ink-500 mt-1">Min 1, max 1,000,000</div>
      </div>

      <div className="card p-3 bg-[rgb(var(--border))]/30 space-y-1">
        <div className="text-sm flex items-center justify-between">
          <span className="text-ink-500">Cost per view</span>
          <span className="font-semibold">{formatCoins(reward)} 🪙</span>
        </div>
        <div className="text-sm flex items-center justify-between">
          <span className="text-ink-500">Total cost</span>
          <span className="font-extrabold text-base">{formatCoins(budget)} 🪙</span>
        </div>
        <div className="text-[11px] text-ink-500 pt-1 border-t border-[rgb(var(--border))]">
          Viewers must watch at least {settings.minWatchSeconds}s in-app to earn their reward. Watch time is verified by YouTube IFrame API and resets on pause/buffer/seek.
        </div>
      </div>

      {budget > balance && <div className="text-sm text-rose-600">You need {formatCoins(budget - balance)} more coins. <Link className="underline" href="/coins">Buy coins</Link></div>}
      {err && <div className="text-sm text-rose-600">{err}</div>}

      <button onClick={submit} disabled={!valid || submitting} className="btn btn-primary w-full">
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Create campaign ({formatCoins(budget)} 🪙)
      </button>
    </div>
  );
}

function SubscriberWizard({ settings, balance, youtube }: { settings: Settings; balance: number; youtube: YT }) {
  const [subs, setSubs] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reward per sub is fixed by admin (settings.subscribeRewardCoins)
  const reward = settings.subscribeRewardCoins;
  const budget = subs * reward;

  // The connected channel is auto-selected — no paste needed.
  // (We trust the verified channel from `youtube` rather than re-fetching.)
  const preview = youtube
    ? { id: youtube.id === "" ? "" : (youtube as { id: string }).id, title: youtube.title, thumbnail: youtube.thumbnailUrl ?? "", handle: youtube.handle }
    : null;
  // The connected channel id is available in `youtube`; we keep the YouTubeChannel model
  // ID internally distinct from the youtubeId, so we need to pass youtubeId instead.
  // To keep the API simple, we use a dedicated preview from a hidden fetch.
  const [resolved, setResolved] = useState<{ id: string; title: string; thumbnail: string; handle: string | null } | null>(null);

  useEffect(() => {
    if (!youtube) {
      setResolved(null);
      return;
    }
    // Fetch the youtubeId (YouTube channel ID) for the connected channel from settings
    let alive = true;
    fetch("/api/youtube/lookup-channel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: youtube.handle ? `@${youtube.handle}` : youtube.title }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.channel) setResolved(j.channel);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [youtube]);

  async function submit() {
    if (!resolved) return;
    setSubmitting(true); setErr(null);
    try {
      const r = await fetch("/api/campaigns/subscriber", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetChannelId: resolved.id, targetSubscribers: subs }),
      });
      const j = await r.json();
      if (!r.ok) {
        const msg = j?.error?.message || "Failed";
        if (j?.error?.code === "DUPLICATE_CAMPAIGN") {
          toast({ title: "Campaign already exists", description: msg, variant: "error" });
        }
        setErr(msg);
        return;
      }
      toast({ title: "Campaign created", description: "Your S2S campaign is live.", variant: "success" });
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  const valid = subs >= 1 && subs <= 100000 && budget >= settings.minBudget && budget <= settings.maxBudget && budget <= balance && resolved;

  return (
    <div className="space-y-4">
      {/* Connected-channel preview — auto-filled, no paste */}
      <div>
        <label className="text-sm font-medium">Target channel</label>
        <div className="mt-1 card p-3 flex gap-3 items-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200">
          {resolved?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolved.thumbnail} alt="" className="size-12 rounded-full" />
          ) : (
            <div className="size-12 rounded-full bg-[rgb(var(--border))] animate-pulse" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{resolved?.title || youtube?.title || "Your channel"}</div>
            <div className="text-xs text-ink-500">{resolved?.handle ? `@${resolved.handle}` : youtube?.handle ? `@${youtube.handle}` : ""}</div>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Connected
          </div>
        </div>
        <div className="text-[11px] text-ink-500 mt-1">Auto-filled from your connected YouTube account. No paste needed.</div>
      </div>

      <div>
        <label className="text-sm font-medium">How many subscribers do you want?</label>
        <input
          type="number"
          min={1}
          value={subs}
          onChange={(e) => setSubs(Math.max(1, Number(e.target.value) || 0))}
          className="input mt-1"
        />
        <div className="text-[11px] text-ink-500 mt-1">Min 1, max 100,000</div>
      </div>

      <div className="card p-3 bg-[rgb(var(--border))]/30 space-y-1">
        <div className="text-sm flex items-center justify-between">
          <span className="text-ink-500">Cost per sub</span>
          <span className="font-semibold">{formatCoins(reward)} 🪙</span>
        </div>
        <div className="text-sm flex items-center justify-between">
          <span className="text-ink-500">Total cost</span>
          <span className="font-extrabold text-base">{formatCoins(budget)} 🪙</span>
        </div>
        <div className="text-[11px] text-ink-500 pt-1 border-t border-[rgb(var(--border))]">
          Subscribers must verify ownership of a YouTube account. Subscriptions are re-verified every 5 minutes — if a user unsubscribes, their reward is reversed.
        </div>
      </div>

      {budget > balance && <div className="text-sm text-rose-600">You need {formatCoins(budget - balance)} more coins. <Link className="underline" href="/coins">Buy coins</Link></div>}
      {err && <div className="text-sm text-rose-600">{err}</div>}

      <button onClick={submit} disabled={!valid || submitting} className="btn btn-primary w-full">
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />} Create S2S campaign
      </button>
    </div>
  );
}

function CampaignRow({ c, onChange }: { c: Campaign; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  async function setStatus(status: string) {
    setBusy(true);
    await fetch(`/api/campaigns/${c.id}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(false); onChange();
  }
  const pct = c.totalBudget > 0 ? Math.min(100, Math.round((c.spentBudget / c.totalBudget) * 100)) : 0;
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{c.title}</div>
          <div className="text-[11px] text-ink-500">{c.type === "VIDEO_VIEW" ? "Video" : "Subscriber"} · {c.status.toLowerCase()} · {timeAgo(c.createdAt)}</div>
        </div>
        <div className="chip">{c.rewardPerAction} 🪙</div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-pink-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-ink-500">
        <span>{formatNumber(c.completedActions)}/{formatNumber(c.maxActions)} actions</span>
        <span>{formatNumber(c.spentBudget)}/{formatNumber(c.totalBudget)} 🪙</span>
      </div>
      <div className="mt-2 flex gap-1">
        {c.status === "ACTIVE" ? (
          <button onClick={() => setStatus("PAUSED")} disabled={busy} className="btn btn-ghost h-7 px-2 text-xs"><Pause size={12} /> Pause</button>
        ) : c.status === "PAUSED" ? (
          <button onClick={() => setStatus("ACTIVE")} disabled={busy} className="btn btn-ghost h-7 px-2 text-xs"><Play size={12} /> Resume</button>
        ) : null}
        {(c.status === "DRAFT" || c.status === "REJECTED") && (
          <button onClick={() => setStatus("CANCELLED")} disabled={busy} className="btn btn-ghost h-7 px-2 text-xs text-rose-600"><Trash2 size={12} /> Cancel</button>
        )}
        {c.type === "VIDEO_VIEW" && c.youtubeVideoId && (
          <a href={`https://www.youtube.com/watch?v=${c.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-7 px-2 text-xs"><ExternalLink size={12} /></a>
        )}
        {c.type === "SUBSCRIBER" && c.youtubeChannelId && (
          <a href={`https://www.youtube.com/channel/${c.youtubeChannelId}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-7 px-2 text-xs"><ExternalLink size={12} /></a>
        )}
      </div>
    </div>
  );
}
