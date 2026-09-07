"use client";

import { useState, useRef, useEffect } from "react";
import { DiscoverGrid, type VideoPlayerOpenPayload } from "./discover-grid";
import { VideoPlayer } from "./video-player";
import { useRouter } from "next/navigation";
import { toast } from "./toast";
import { ReversedAlert } from "./reversed-alert";

export function S2SClient() {
  const router = useRouter();
  const [active, setActive] = useState<VideoPlayerOpenPayload | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const queueRef = useRef<((p: VideoPlayerOpenPayload) => void) | null>(null);

  function openNext() {
    const fn = (window as unknown as { __openNextVideo?: () => void }).__openNextVideo;
    if (fn) fn();
  }

  useEffect(() => {
    if (!active) {
      setHasNext(false);
      return;
    }
    setHasNext(true);
  }, [active]);

  function onSuccess() {
    toast({ title: "Reward verified", description: "Loading next video…", variant: "success" });
    router.refresh();
    setActive(null);
  }

  return (
    <>
      <ReversedAlert onResubscribe={() => router.refresh()} />
      <DiscoverGrid
        onOpenVideo={(p) => {
          setActive(p);
        }}
      />
      {active && (
        <VideoPlayer
          campaignId={active.campaignId}
          videoId={active.videoId}
          title={active.title}
          channelTitle={active.channelTitle}
          minWatchSeconds={active.minWatchSeconds}
          rewardCoins={active.rewardCoins}
          onClose={() => setActive(null)}
          onSuccess={() => onSuccess()}
          onAutoNext={() => {
            setActive(null);
            setTimeout(() => openNext(), 200);
          }}
          hasNext={hasNext}
        />
      )}
    </>
  );
}
