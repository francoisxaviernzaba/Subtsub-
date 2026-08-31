"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Bell } from "lucide-react";

type Notif = { id: string; kind: string; title: string; body?: string | null; link?: string | null; read: boolean; createdAt: string };

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (alive) setItems(j.items ?? []); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="absolute right-3 top-14 mt-1 w-[360px] max-w-[92vw] card p-2 animate-fade-in z-50">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="font-semibold text-sm">Notifications</div>
        <button onClick={markAllRead} className="text-xs text-brand-600 font-semibold">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-auto scroll-thin">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-ink-500 text-sm">
            <Bell size={20} className="mx-auto mb-2" />
            No notifications yet
          </div>
        ) : (
          items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={onClose}
              className={`flex gap-2 px-2 py-2 rounded-lg hover:bg-[rgb(var(--border))]/50 ${!n.read ? "bg-brand-50/40 dark:bg-brand-900/10" : ""}`}
            >
              <div className={`mt-1.5 size-2 rounded-full ${!n.read ? "bg-brand-500" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{n.title}</div>
                {n.body && <div className="text-xs text-ink-500 line-clamp-2">{n.body}</div>}
                <div className="text-[11px] text-ink-400 mt-0.5">{timeAgo(n.createdAt)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
