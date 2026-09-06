"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ReversedItem = {
  id: string;
  campaignId: string;
  title: string;
  channelId: string;
  thumbnailUrl: string | null;
  rewardCoins: number;
  failureReason: string | null;
  revokedAt: string;
};

export function ReversedAlert({ onResubscribe }: { onResubscribe?: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReversedItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/tasks/subscribe/reversed", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setItems(data.items || []);
      setOpen(data.items.length > 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (loading || items.length === 0 || !open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg card border-rose-200 bg-white shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-ink-400 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-rose-600">⚠️ Subscription Reversed</h2>
          <p className="mt-2 text-sm text-ink-600">
            We detected you unsubscribed from one or more channels. Your rewards have been reversed and the tasks are back in Discover for you to re-subscribe.
          </p>

          <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.title}</div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {item.rewardCoins} coins reversed
                  </div>
                  {item.failureReason && (
                    <div className="text-xs text-ink-400 mt-0.5">Reason: {item.failureReason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setOpen(false);
                onResubscribe?.();
              }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800"
            >
              Go to Discover
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-ink-200 text-sm font-semibold hover:bg-ink-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
