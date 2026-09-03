"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Loader2, Coins, AlertTriangle, CheckCircle2, SkipForward } from "lucide-react";
import { toast } from "./toast";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  loadModule(name: string): void;
  destroy?(): void;
  unloadModule?(name: string): void;
  setOption?(module: string, option: string, value: unknown): void;
  getOption?(module: string, option: string): unknown;
  addEventListener?(event: string, listener: (e: { data?: number; target?: YTPlayer }) => void): void;
  removeEventListener?(event: string, listener: (e: { data?: number; target?: YTPlayer }) => void): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number; target: YTPlayer }) => void;
        onPlaybackQualityChange?: (e: { data: string; target: YTPlayer }) => void;
        onPlaybackRateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

const YT: YTNamespace = (typeof window !== "undefined" && window.YT) || ({} as YTNamespace);

type Props = {
  videoId: string;
  title: string;
  channelTitle: string;
  minWatchSeconds: number;
  rewardCoins: number;
  campaignId: string;
  onClose: () => void;
  onSuccess: (reward: number, balance: number) => void;
  onAutoNext?: () => void;
  hasNext?: boolean;
};

const HEARTBEAT_INTERVAL_MS = 1000;
const MAX_IDLE_BEFORE_RESET_MS = 3000; // if no heartbeat for 3s, treat as error
const MAX_BUFFERING_MS = 15000; // if buffering for 15s, treat as error

export type VideoPlayerOpenPayload = {
  campaignId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  minWatchSeconds: number;
  rewardCoins: number;
};

export function VideoPlayer({ videoId, title, channelTitle, minWatchSeconds, rewardCoins, campaignId, onClose, onSuccess, onAutoNext, hasNext }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const apiReadyRef = useRef(false);

  // Watch tracking
  const watchedRef = useRef(0); // total accumulated watched seconds (monotonic)
  const lastTickAtRef = useRef<number | null>(null);
  const lastHeartbeatAtRef = useRef<number>(0);
  const lastPositionRef = useRef<number>(0);
  const bufferingStartedAtRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const alreadyClaimedRef = useRef(false);

  // UI state
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [playerState, setPlayerState] = useState<"loading" | "ready" | "playing" | "paused" | "buffering" | "ended" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const progress = Math.min(100, (watchedSeconds / minWatchSeconds) * 100);
  const canClaim = watchedSeconds >= minWatchSeconds && !claiming && !alreadyClaimedRef.current;

  // Build the YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) {
      apiReadyRef.current = true;
      return;
    }
    const existing = document.querySelector('script[data-yt-iframe-api]');
    if (existing) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        apiReadyRef.current = true;
        if (playerRef.current === null) {
          initPlayer();
        }
      };
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.dataset.ytIframeApi = "1";
    document.body.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      apiReadyRef.current = true;
      if (playerRef.current === null) {
        initPlayer();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;
    if (!window.YT || !window.YT.Player) return;
    const player = new window.YT.Player(containerRef.current, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      },
      events: {
        onReady: (e) => {
          setPlayerState("ready");
          try {
            e.target.playVideo();
          } catch {
            /* ignore autoplay block */
          }
        },
        onStateChange: (e) => {
          const state = e.data;
          const YTPS = (window.YT && window.YT.PlayerState) || {
            UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5,
          };
          if (state === YTPS.PLAYING) {
            isPlayingRef.current = true;
            bufferingStartedAtRef.current = null;
            lastTickAtRef.current = Date.now();
            lastPositionRef.current = e.target.getCurrentTime();
            setPlayerState("playing");
          } else if (state === YTPS.PAUSED) {
            isPlayingRef.current = false;
            flushTick();
            setPlayerState("paused");
          } else if (state === YTPS.BUFFERING) {
            isPlayingRef.current = false;
            flushTick();
            if (bufferingStartedAtRef.current === null) bufferingStartedAtRef.current = Date.now();
            setPlayerState("buffering");
          } else if (state === YTPS.ENDED) {
            isPlayingRef.current = false;
            flushTick();
            setPlayerState("ended");
          } else if (state === YTPS.CUED || state === YTPS.UNSTARTED) {
            isPlayingRef.current = false;
            flushTick();
          }
        },
        onError: (e) => {
          isPlayingRef.current = false;
          const code = e.data;
          setErrorMsg(playerErrorMessage(code));
          setPlayerState("error");
        },
      },
    });
    playerRef.current = player;
  }, [videoId]);

  function playerErrorMessage(code: number): string {
    switch (code) {
      case 2: return "Invalid video ID.";
      case 5: return "The video cannot be played in an embedded player.";
      case 100: return "The video has been removed or is private.";
      case 101:
      case 150: return "The video owner does not allow embedding.";
      default: return "Playback error. Please try again.";
    }
  }

  // Once API is ready, init the player
  useEffect(() => {
    if (apiReadyRef.current && !playerRef.current) {
      initPlayer();
    }
  }, [initPlayer]);

  // Heartbeat: only count time when state is PLAYING and position is monotonically advancing
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      lastHeartbeatAtRef.current = now;

      if (playerState === "error" || alreadyClaimedRef.current) return;

      // Buffering timeout: if stuck buffering too long, error out
      if (playerState === "buffering") {
        if (bufferingStartedAtRef.current && now - bufferingStartedAtRef.current > MAX_BUFFERING_MS) {
          setErrorMsg("Video stalled. Please try again.");
          setPlayerState("error");
          isPlayingRef.current = false;
          try { playerRef.current?.stopVideo(); } catch { /* ignore */ }
          return;
        }
      }

      if (isPlayingRef.current && playerRef.current) {
        const cur = playerRef.current.getCurrentTime();
        const prev = lastPositionRef.current;
        // Only credit if current position is slightly ahead of last (normal playback)
        // If it jumped way ahead (seek), don't credit the gap
        const delta = cur - prev;
        if (delta > 0 && delta < 2) {
          // Normal forward playback — credit
          watchedRef.current += delta;
          setWatchedSeconds(watchedRef.current);
        }
        // If delta is negative (user seeked backwards) or > 2 (seeked forward), do not credit
        lastPositionRef.current = cur;
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playerState]);

  function flushTick() {
    if (lastTickAtRef.current !== null && isPlayingRef.current) {
      const now = Date.now();
      const delta = (now - lastTickAtRef.current) / 1000;
      if (delta > 0 && delta < 2) {
        watchedRef.current += delta;
        setWatchedSeconds(watchedRef.current);
      }
      lastTickAtRef.current = null;
    }
  }

  async function claim() {
    if (!canClaim) return;
    setClaiming(true);
    try {
      const r = await fetch("/api/tasks/view/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          campaignId,
          watchSeconds: Math.floor(watchedRef.current),
          idempotencyKey: `view.${campaignId}.${Date.now()}`,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErrorMsg(j?.error?.message || "Verification failed");
        setClaiming(false);
        return;
      }
      alreadyClaimedRef.current = true;
      isPlayingRef.current = false;
      try { playerRef.current?.pauseVideo(); } catch { /* ignore */ }
      toast({ title: `+${j.reward} coins`, description: "Reward verified", variant: "success" });
      onSuccess(j.reward, j.balance);
    } catch {
      setErrorMsg("Network error");
      setClaiming(false);
    }
  }

  function close() {
    isPlayingRef.current = false;
    try { playerRef.current?.stopVideo(); } catch { /* ignore */ }
    try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    playerRef.current = null;
    onClose();
  }

  // Cleanup on unmount (e.g. parent re-renders, route change)
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      try { playerRef.current?.stopVideo(); } catch { /* ignore */ }
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
      playerRef.current = null;
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="min-w-0">
            <div className="text-xs text-ink-500 truncate">{channelTitle}</div>
            <div className="font-semibold truncate">{title}</div>
          </div>
          <button
            onClick={close}
            aria-label="Close video"
            title="Close (Esc)"
            className="size-10 grid place-items-center rounded-full hover:bg-rose-50 text-ink-500 hover:text-rose-600 flex-shrink-0 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
          <div ref={containerRef} className="absolute inset-0" />
          {playerState === "loading" && (
            <div className="absolute inset-0 grid place-items-center text-white">
              <Loader2 className="animate-spin" size={32} />
              <div className="absolute bottom-4 text-sm">Loading video…</div>
            </div>
          )}
          {playerState === "error" && errorMsg && (
            <div className="absolute inset-0 grid place-items-center text-white p-4 text-center">
              <div>
                <AlertTriangle className="mx-auto mb-2" size={32} />
                <div className="font-semibold">{errorMsg}</div>
                <div className="text-xs text-white/70 mt-1">No reward was given.</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">
                Watched: <span className="font-bold text-ink-900">{Math.floor(watchedSeconds)}s</span>
                {" / "}
                {minWatchSeconds}s required
              </span>
              <span className="font-semibold flex items-center gap-1 text-amber-600">
                <Coins size={14} /> {rewardCoins}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
              <div
                className={`h-full transition-all ${canClaim ? "bg-emerald-500" : "bg-gradient-to-r from-brand-500 to-pink-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {playerState === "paused" && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              Video is paused. Watch time stops counting while paused.
            </div>
          )}
          {playerState === "buffering" && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" /> Buffering… Watch time paused.
            </div>
          )}

          {alreadyClaimedRef.current ? (
            <>
              <div className="btn w-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={14} /> Reward verified · +{rewardCoins} coins
              </div>
              {hasNext && onAutoNext && (
                <button
                  onClick={() => {
                    isPlayingRef.current = false;
                    try { playerRef.current?.stopVideo(); } catch { /* ignore */ }
                    try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
                    playerRef.current = null;
                    onAutoNext();
                  }}
                  className="btn btn-primary w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  <SkipForward size={16} /> Auto-play next video
                </button>
              )}
            </>
          ) : (
            <button
              onClick={claim}
              disabled={!canClaim}
              className="btn btn-primary w-full h-12"
            >
              {claiming ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
              {canClaim ? `Claim +${rewardCoins} coins` : `Watch ${Math.max(0, minWatchSeconds - Math.floor(watchedSeconds))}s more`}
            </button>
          )}
          <button onClick={close} className="btn btn-outline w-full h-10 text-sm">
            <X size={14} /> Close player
          </button>
          <div className="text-[11px] text-ink-500 text-center">
            Watch time only counts while the video is actually playing. Pausing, seeking, buffering, or leaving the player resets the counter.
          </div>
        </div>
      </div>
    </div>
  );
}
