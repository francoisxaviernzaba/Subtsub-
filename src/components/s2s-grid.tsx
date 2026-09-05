"use client";

import { useState, useEffect, useCallback } from "react";
import { Coins, Users, ExternalLink, CheckCircle2, Loader2, X } from "lucide-react";
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
  const [state, setState] = useState<"idle" | "verifying" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const channelTitle = campaign.owner.youtubeChannel?.title || campaign.owner.name || "Channel";
  const channelHandle = campaign.owner.youtubeChannel?.handle || "";
  const channelAvatar = campaign.owner.youtubeChannel?.thumbnailUrl;
  const remaining = Math.max(0, campaign.maxActions - campaign.completedActions);
  const budgetLeft = Math.max(0, campaign.totalBudget - campaign.spentBudget);

  const doClaim = useCallback(async () => {
    if (state === "verifying" || state === "done") return;
    setState("verifying");
    setErrMsg(null);
    try {
      const r = await fetch("/api/tasks/subscribe/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      const j = await r.json();
      if (!r.ok) {
        setState("error");
        setErrMsg(j?.error?.message || "Could not verify");
        toast({ title: "Verification failed", description: j?.error?.message, variant: "error" });
        return;
      }
      setState("done");
      toast({ title: `+${j.reward} coins`, description: "Subscription verified", variant: "success" });
      onDone();
      router.refresh();
    } catch (e) {
      setState("error");
      setErrMsg("Network error");
    }
  }, [campaign.id, onDone, router, state]);

  useEffect(() => {
    function onFocus() {
      if (state === "idle") doClaim();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [doClaim, state]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
          {channelAvatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channelAvatar} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{channelTitle}</div>
          {channelHandle && <div className="text-xs text-ink-500">@{channelHandle}</div>}
        </div>
        <div className="chip bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
          <Coins size={12} /> {campaign.rewardPerAction}
        </div>
      </div>

      <div className="mt-3 text-sm text-ink-500">
        Subscribers campaign · {formatNumber(remaining)} left · {formatNumber(budgetLeft)} 🪙 left
      </div>

      <div className="mt-3 space-y-2">
        {state === "done" ? (
          <div className="btn w-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} /> Verified · +{campaign.rewardPerAction}
          </div>
        ) : state === "error" ? (
          <>
            <div className="text-xs text-rose-600">{errMsg}</div>
            <button onClick={doClaim} className="btn btn-outline w-full">Try again</button>
          </>
        ) : state === "verifying" ? (
          <button disabled className="btn btn-primary w-full">
            <Loader2 size={14} className="animate-spin" /> Verifying…
          </button>
        ) : (
          <>
            <a
              href={`https://www.youtube.com/channel/${campaign.youtubeChannelId}?sub_confirmation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full"
            >
              <ExternalLink size={14} /> Open & Subscribe on YouTube
            </a>
            <button onClick={doClaim} className="btn btn-primary w-full">
              <Users size={14} /> Verify My Subscription
            </button>
          </>
        )}
      </div>
    </div>
  );
}
