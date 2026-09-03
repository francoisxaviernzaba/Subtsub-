"use client";

import { useState, useEffect } from "react";
import { toast } from "./toast";
import { Copy, Gift, Share2 } from "lucide-react";

export function InviteSection({ userId }: { userId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await fetch("/api/invite");
      if (r.ok) {
        const j = await r.json();
        setCode(j.inviteCode);
        setCount(j.invitedCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setLoading(true);
    const r = await fetch("/api/invite", { method: "POST" });
    setLoading(false);
    if (r.ok) {
      const j = await r.json();
      setCode(j.inviteCode);
      toast({ title: "Invite code generated" });
    }
  }

  async function copy() {
    if (!code) return;
    await navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${code}`);
    toast({ title: "Invite link copied" });
  }

  if (loading) {
    return <div className="card p-4 text-sm text-ink-500">Loading invite…</div>;
  }

  if (!code) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="text-brand-500" size={20} />
          <div className="font-semibold">Invite friends & earn coins</div>
        </div>
        <p className="text-sm text-ink-500 mb-3">Generate an invite code and share it. You earn coins when your invitees sign up and connect YouTube.</p>
        <button onClick={generate} className="btn btn-primary">Generate invite code</button>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="text-brand-500" size={20} />
        <div className="font-semibold">Invite friends & earn coins</div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="px-3 py-1.5 rounded-lg bg-[rgb(var(--border))] font-mono text-sm tracking-wider">{code}</div>
        <button onClick={copy} className="btn btn-ghost h-8 px-2 text-xs"><Copy size={12} /> Copy</button>
      </div>
      <p className="text-xs text-ink-500">Share this link: <span className="font-mono">{`${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${code}`}</span></p>
      <p className="text-xs text-ink-500 mt-1">{count} invites completed</p>
    </div>
  );
}
