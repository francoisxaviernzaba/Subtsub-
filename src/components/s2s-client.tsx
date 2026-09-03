"use client";

import { useState, useRef, useEffect } from "react";
import { DiscoverGrid, type VideoPlayerOpenPayload } from "./discover-grid";
import { VideoPlayer } from "./video-player";
import { useRouter } from "next/navigation";
import { toast } from "./toast";

export function S2SClient() {
  const router = useRouter();
  const [active, setActive] = useState<VideoPlayerOpenPayload | null>(null);
  const [hasNext, setHasNext] = useState(false);
  // cache of next-in-queue candidates — populated from window.__openNextVideo
  const queueRef = useRef<((p: VideoPlayerOpenPayload) => void) | null>(null);

  // The DiscoverGrid exposes a global __openNextVideo that returns the next available
  // video's payload. We use it to enable auto-play after success.
  function openNext() {
    const fn = (window as unknown as { __openNextVideo?: () => void }).__openNextVideo;
    if (fn) fn();
  }

  // After a successful claim, we need to determine if there's a next video available.
  // The DiscoverGrid manages the video list; we listen to its updates via the
  // __openNextVideo global and update hasNext when an active player is shown.
  useEffect(() => {
    if (!active) {
      setHasNext(false);
      return;
    }
    // We optimistically assume there's a next. The actual "hasNext" is determined
    // by the grid's available list, which we don't directly observe here.
    // A simpler approach: set a default of true and let the user retry.
    setHasNext(true);
  }, [active]);

  function onSuccess() {
    toast({ title: "Reward verified", description: "Loading next video…", variant: "success" });
    // Refresh the grid data so completed campaigns disappear
    router.refresh();
    // The grid exposes __openNextVideo; if it returns a payload, the DiscoverGrid
    // will mount a new player via its internal state. We can also just close this
    // one and let the next click from the user pick it up.
    // For now, close the current player and let user open next manually.
    setActive(null);
  }

  return (
    <>
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
            // small delay so the next video is mounted
            setTimeout(() => openNext(), 200);
          }}
          hasNext={hasNext}
        />
      )}
    </>
  );
}
