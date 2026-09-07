"use client";

import { useState } from "react";
import { Coins, Eye, Users, Loader2, Play, CheckCircle2, Lock, SkipForward, AlertTriangle } from "lucide-react";
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
  const [state, setState] = useState<"idle" | "opened" | "countdown" | "verifying" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

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
    if (!isClaimable) return;
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
