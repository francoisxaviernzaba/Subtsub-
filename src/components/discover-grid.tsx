"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CampaignCard } from "./campaign-card";
import { Loader2, Eye, Users } from "lucide-react";
import Link from "next/link";

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

export type VideoPlayerOpenPayload = {
  campaignId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  minWatchSeconds: number;
  rewardCoins: number;
};

type Props = {
  onOpenVideo: (p: VideoPlayerOpenPayload) => void;
};

export function DiscoverGrid({ onOpenVideo }: Props) {
  const [videos, setVideos] = useState<Campaign[]>([]);
  const [subs, setSubs] = useState<Campaign[]>([]);
  const [videoCursor, setVideoCursor] = useState<string | null>(null);
  const [subCursor, setSubCursor] = useState<string | null>(null);
  const [videosDone, setVideosDone] = useState(false);
  const [subsDone, setSubsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const videoSentinel = useRef<HTMLDivElement>(null);
  const subSentinel = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (type: "VIDEO_VIEW" | "SUBSCRIBER", cursor: string | null, reset = false) => {
    if (loading) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (!reset && cursor) params.set("cursor", cursor);
    params.set("take", "20");
    params.set("type", type);
    const r = await fetch(`/api/discover?${params.toString()}`);
    if (!r.ok) { setLoading(false); setInitialLoad(false); return; }
    const j = await r.json();
    if (type === "VIDEO_VIEW") {
      setVideos((prev) => reset ? (j.items as Campaign[]) : [...prev, ...(j.items as Campaign[])]);
      setVideoCursor(j.nextCursor);
      if (!j.nextCursor) setVideosDone(true);
    } else {
      setSubs((prev) => reset ? (j.items as Campaign[]) : [...prev, ...(j.items as Campaign[])]);
      setSubCursor(j.nextCursor);
      if (!j.nextCursor) setSubsDone(true);
    }
    setLoading(false);
    setInitialLoad(false);
  }, [loading]);

  useEffect(() => {
    fetchPage("VIDEO_VIEW", null, true);
    fetchPage("SUBSCRIBER", null, true);
  }, []);

  // Infinite scroll for videos
  useEffect(() => {
    const el = videoSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting && !videosDone && !loading) fetchPage("VIDEO_VIEW", videoCursor);
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchPage, videoCursor, videosDone]);

  // Infinite scroll for subs
  useEffect(() => {
    const el = subSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting && !subsDone && !loading) fetchPage("SUBSCRIBER", subCursor);
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchPage, subCursor, subsDone]);

  // Expose a helper to open the next available video (for auto-play queue)
  useEffect(() => {
    (window as unknown as { __openNextVideo: () => void }).__openNextVideo = () => {
      const next = videos.find((v) => v.userState === "AVAILABLE" && v.youtubeVideoId);
      if (next && next.youtubeVideoId) {
        const channelTitle = next.owner.youtubeChannel?.title || next.owner.name || "Creator";
        onOpenVideo({
          campaignId: next.id,
          videoId: next.youtubeVideoId,
          title: next.title,
          channelTitle,
          minWatchSeconds: next.minWatchSeconds,
          rewardCoins: next.rewardPerAction,
        });
      }
    };
  }, [videos, onOpenVideo]);

  const availableVideos = videos.filter((v) => v.userState === "AVAILABLE");
  const availableSubs = subs.filter((s) => s.userState === "AVAILABLE");

  if (initialLoad) {
    return (
      <div className="space-y-8">
        <section>
          <div className="h-6 w-32 skeleton rounded mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
                <div className="skeleton w-full" style={{ aspectRatio: "16/9" }} />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Videos section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white shadow-glow">
            <Eye size={16} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">Videos</h2>
            <p className="text-xs text-ink-500">Watch in-app for coins</p>
          </div>
          {videos.length > 0 && <div className="ml-auto chip">{availableVideos.length} available</div>}
        </div>
        {videos.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-500">No video campaigns yet. Create one from the Boost tab.</p>
          </div>
        ) : (
          <div className="masonry">
            {videos.map((c) => (
              <CampaignCard key={c.id} campaign={c} onOpenVideo={onOpenVideo} />
            ))}
          </div>
        )}
        <div ref={videoSentinel} className="h-10 grid place-items-center mt-3">
          {loading && <Loader2 className="animate-spin" size={20} />}
          {videosDone && videos.length > 0 && <div className="text-xs text-ink-500">No more videos</div>}
        </div>
      </section>

      {/* Subscribers section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 grid place-items-center text-white shadow-glow">
            <Users size={16} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">Subscribe to earn</h2>
            <p className="text-xs text-ink-500">Verify your subscription via Google OAuth</p>
          </div>
          {subs.length > 0 && <div className="ml-auto chip">{availableSubs.length} available</div>}
        </div>
        {subs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-500">No subscriber campaigns yet. Create one from the Boost tab.</p>
          </div>
        ) : (
          <div className="masonry">
            {subs.map((c) => (
              <CampaignCard key={c.id} campaign={c} onOpenVideo={onOpenVideo} />
            ))}
          </div>
        )}
        <div ref={subSentinel} className="h-10 grid place-items-center mt-3">
          {loading && <Loader2 className="animate-spin" size={20} />}
          {subsDone && subs.length > 0 && <div className="text-xs text-ink-500">No more channels</div>}
        </div>
      </section>
    </div>
  );
}
