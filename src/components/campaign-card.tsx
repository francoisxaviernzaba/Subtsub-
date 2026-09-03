"use client";

import { useState } from "react";
import { Coins, Eye, Users, Loader2, Play, CheckCircle2, Lock, SkipForward } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { toast } from "./toast";
import { useRouter } from "next/navigation";
import { VideoPlayer, type VideoPlayerOpenPayload } from "./video-player";

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

type Props = {
  campaign: Campaign;
  onOpenVideo?: (p: VideoPlayerOpenPayload) => void;
};

export function CampaignCard({ campaign, onOpenVideo }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "verifying" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const remaining = Math.max(0, campaign.maxActions - campaign.completedActions);
  const budgetLeft = Math.max(0, campaign.totalBudget - campaign.spentBudget);

  const isVideo = campaign.type === "VIDEO_VIEW";
  const thumb = campaign.thumbnailUrl || (isVideo ? `https://i.ytimg.com/vi/${campaign.youtubeVideoId}/hqdefault.jpg` : null);
  const channelTitle = campaign.owner.youtubeChannel?.title || campaign.owner.name || "Creator";
  const channelAvatar = campaign.owner.youtubeChannel?.thumbnailUrl || campaign.owner.image;

  const isClaimable = campaign.userState === "AVAILABLE";
  const isCompleted = campaign.userState === "COMPLETED";
  const isPending = campaign.userState === "PENDING";
  const isBlocked = campaign.userState === "EXHAUSTED" || campaign.userState === "PAUSED";

  function startVideo() {
    if (!isClaimable || state !== "idle") return;
    if (!campaign.youtubeVideoId) return;
    onOpenVideo?.({
      campaignId: campaign.id,
      videoId: campaign.youtubeVideoId,
      title: campaign.title,
      channelTitle,
      minWatchSeconds: campaign.minWatchSeconds,
      rewardCoins: campaign.rewardPerAction,
    });
  }

  async function claimSubscribe() {
    if (!isClaimable || state !== "idle") return;
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
        toast({ title: "Verification failed", description: j?.error?.message || "Please try again", variant: "error" });
        return;
      }
      setState("done");
      toast({ title: `+${j.reward} coins`, description: "Subscription verified", variant: "success" });
      router.refresh();
    } catch {
      setState("error");
      setErrMsg("Network error");
    }
  }

  return (
    <div className="card overflow-hidden group">
      <div className="relative">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={campaign.title} className="w-full block" style={{ aspectRatio: isVideo ? "16/9" : "4/5" }} />
        ) : (
          <div className="w-full bg-[rgb(var(--border))]" style={{ aspectRatio: "4/5" }} />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="chip bg-black/60 text-white">
            {isVideo ? <Eye size={12} /> : <Users size={12} />}
            {isVideo ? "View" : "Subscribe"}
          </span>
        </div>
        <div className="absolute top-2 right-2 chip bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
          <Coins size={12} /> {campaign.rewardPerAction}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-full overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
            {channelAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channelAvatar} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{channelTitle}</div>
            <div className="text-[11px] text-ink-500 truncate">
              {isVideo ? "Video campaign" : "Subscriber campaign"} · {formatNumber(remaining)} left
            </div>
          </div>
        </div>

        <div className="mt-2 text-sm font-medium line-clamp-2">{campaign.title}</div>

        <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
          <span>Budget: {formatNumber(budgetLeft)} / {formatNumber(campaign.totalBudget)} 🪙</span>
          {isVideo && <span>{campaign.minWatchSeconds}s watch</span>}
        </div>

        <div className="mt-3">
          {state === "done" || isCompleted ? (
            <div className="btn w-full bg-emerald-100 text-emerald-700 border border-emerald-200" title="You already earned this reward">
              <CheckCircle2 size={14} /> Reward earned · +{campaign.rewardPerAction}
            </div>
          ) : isPending ? (
            <div className="btn w-full bg-amber-50 text-amber-700 border border-amber-200" title="Verification in progress">
              <Loader2 size={14} className="animate-spin" /> Verification pending
            </div>
          ) : state === "error" ? (
            <div className="space-y-2">
              <div className="text-xs text-rose-600">{errMsg}</div>
              <button onClick={isVideo ? startVideo : claimSubscribe} className="btn btn-outline w-full">Try again</button>
            </div>
          ) : isBlocked ? (
            <div className="btn w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed" title="This campaign is no longer available">
              <Lock size={14} /> {campaign.userState === "EXHAUSTED" ? "Budget exhausted" : "Paused"}
            </div>
          ) : isVideo ? (
            <button
              onClick={startVideo}
              disabled={!isClaimable || state !== "idle"}
              className="btn btn-primary w-full"
            >
              <Play size={14} /> Watch & Earn
            </button>
          ) : state === "idle" ? (
            <button
              onClick={claimSubscribe}
              disabled={!isClaimable}
              className="btn btn-primary w-full"
            >
              <Users size={14} /> Subscribe & Earn
            </button>
          ) : (
            <button disabled className="btn btn-primary w-full">
              <Loader2 size={14} className="animate-spin" /> Verifying…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
