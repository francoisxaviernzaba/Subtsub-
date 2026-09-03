"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CampaignCard } from "./campaign-card";
import { Loader2 } from "lucide-react";

type Campaign = {
  id: string;
  type: "VIDEO_VIEW" | "SUBSCRIBER";
  status: string;
  title: string;
  thumbnailUrl: string | null;
  rewardPerAction: number;
  totalBudget: number;
  spentBudget: number;
  maxActions: number;
  completedActions: number;
  minWatchSeconds: number;
  youtubeVideoId: string | null;
  youtubeChannelId: string | null;
  owner: { name: string | null; image: string | null; youtubeChannel: { thumbnailUrl: string | null; title: string | null; handle: string | null } | null };
  userState: "AVAILABLE" | "COMPLETED" | "PENDING" | "EXHAUSTED" | "PAUSED";
};

export function DiscoverGrid() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "VIDEO_VIEW" | "SUBSCRIBER">("ALL");
  const sentinel = useRef<HTMLDivElement>(null);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    if (!reset && done) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (!reset && cursor) params.set("cursor", cursor);
    params.set("take", "20");
    const r = await fetch(`/api/discover?${params.toString()}`);
    if (!r.ok) { setLoading(false); return; }
    const j = await r.json();
    setItems((prev) => reset ? (j.items as Campaign[]) : [...prev, ...(j.items as Campaign[])]);
    setCursor(j.nextCursor);
    if (!j.nextCursor) setDone(true);
    setLoading(false);
  }, [cursor, done, loading]);

  useEffect(() => { load(true); /* initial */ }, []);

  // infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) load(false);
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  const filtered = items.filter((c) => {
    if (filter !== "ALL" && c.type !== filter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")}>All</FilterChip>
        <FilterChip active={filter === "VIDEO_VIEW"} onClick={() => setFilter("VIDEO_VIEW")}>Videos</FilterChip>
        <FilterChip active={filter === "SUBSCRIBER"} onClick={() => setFilter("SUBSCRIBER")}>Subscribers</FilterChip>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <div className="masonry">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      <div ref={sentinel} className="h-12 grid place-items-center mt-4">
        {loading && <Loader2 className="animate-spin" size={20} />}
        {done && items.length > 0 && <div className="text-xs text-ink-500">You&apos;re all caught up</div>}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-8 rounded-full text-sm font-medium border ${active ? "bg-brand-600 text-white border-brand-600" : "bg-transparent border-[rgb(var(--border))] hover:bg-[rgb(var(--border))]/40"}`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto size-12 rounded-2xl bg-[rgb(var(--border))] grid place-items-center text-2xl">✨</div>
      <h3 className="mt-3 font-semibold">No campaigns available yet</h3>
      <p className="text-sm text-ink-500 mt-1">Check back later, or create your own campaign from the Boost tab.</p>
    </div>
  );
}
