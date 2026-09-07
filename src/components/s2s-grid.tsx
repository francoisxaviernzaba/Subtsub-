"use client";

import { useState, useEffect, useCallback } from "react";
import { Coins, Users, ExternalLink, CheckCircle2, Loader2, X, AlertTriangle } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import { toast } from "./toast";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  title: string;
  rewardPerAction: number;
  totalBudget: number;
  spentBudget: number;
  maxActions: number;
  completedActions: number;
  youtubeChannelId: string | null;
  owner: { name: string | null; youtubeChannel: { title: string | null; handle: string | null; thumbnailUrl: string | null } | null };
};

export function S2SGrid({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);

  function removeOne(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }

  return (
    <div>
      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto size-12 rounded-2xl bg-[rgb(var(--border))] grid place-items-center text-2xl">📺</div>
          <h3 className="mt-3 font-semibold">No channels available</h3>
          <p className="text-sm text-ink-500 mt-1">You&apos;ve completed all available S2S tasks, or no campaigns are active right now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => (
            <S2SCard key={c.id} campaign={c} onDone={() => removeOne(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function S2SCard({ campaign, onDone }: { campaign: Item; onDone: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "opened" | "countdown" | "verifying" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const channelTitle = campaign.owner.youtubeChannel?.title || campaign.owner.name || "Channel";
  const channelHandle = campaign.owner.youtubeChannel?.handle || "";
  const channelAvatar = campaign.owner.youtubeChannel?.thumbnailUrl;
  const remaining = Math.max(0, campaign.maxActions - campaign.completedActions);
  const budgetLeft = Math.max(0, campaign.totalBudget - campaign.spentBudget);

  const doClaim = useCallback(async () => {
    if (state === "verifying" || state === "done") return;
    if (isNativeApp() && state === "idle") {
      setState("verifying");
      setErrMsg(null);
      try {
        await window.Capacitor.Plugins.YouTubeOverlay.openYouTubeOverlay({
          url: `https://www.youtube.com/channel/${campaign.youtubeChannelId}?sub_confirmation=1`,
        });
      } catch {
        setState("error");
        setErrMsg("Native overlay failed");
      }
      return;
    }
    if (!isNativeApp() && state === "idle") {
