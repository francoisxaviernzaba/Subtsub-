"use client";

import { useState } from "react";
import { Coins, Check, Loader2, ExternalLink } from "lucide-react";
import { toast } from "./toast";
import { formatCoins, timeAgo } from "@/lib/utils";

type Pkg = { coins: number; amountCents: number; currency: string };
type Payment = { id: string; coins: number; amountCents: number; currency: string; status: string; createdAt: string; provider: string };

export function CoinsClient({ userEmail, balance, packages, recentPayments }: { userEmail: string; balance: number; packages: Pkg[]; recentPayments: Payment[] }) {
  const [busy, setBusy] = useState<number | null>(null);

  async function buy(pkg: Pkg) {
    setBusy(pkg.coins);
    try {
      const r = await fetch("/api/payments/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ coins: pkg.coins, amountCents: pkg.amountCents, currency: pkg.currency, email: userEmail }) });
      const j = await r.json();
      if (!r.ok) { toast({ title: "Purchase failed", description: j?.error?.message, variant: "error" }); return; }
      if (j.mock) {
        toast({ title: `+${j.credited} coins`, description: "Mock purchase credited instantly.", variant: "success" });
        setTimeout(() => location.reload(), 500);
      } else if (j.checkoutUrl) {
        window.location.href = j.checkoutUrl;
      } else {
        toast({ title: "Payment created", description: "Check your payment details.", variant: "success" });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-sm text-ink-500">Your balance</div>
        <div className="text-4xl font-extrabold flex items-center gap-2"><Coins className="text-amber-500" /> {formatCoins(balance)}</div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Top up</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {packages.map((p) => (
            <div key={p.coins} className="card p-4 flex flex-col">
              <div className="text-xs text-ink-500">{p.coins >= 1000 ? `${(p.coins / 1000).toFixed(1)}K` : p.coins} coins</div>
              <div className="mt-1 text-2xl font-extrabold flex items-center gap-1"><Coins className="text-amber-500" size={20} />{formatCoins(p.coins)}</div>
              <div className="text-sm text-ink-500">${(p.amountCents / 100).toFixed(2)} {p.currency}</div>
              <button onClick={() => buy(p)} disabled={busy !== null} className="btn btn-primary mt-3">
                {busy === p.coins ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />} Buy
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-500 mt-2">You will be redirected to Gumroad to complete payment. Coins are credited automatically after purchase.</p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Recent payments</h2>
        <div className="card divide-y divide-[rgb(var(--border))]">
          {recentPayments.length === 0 ? (
            <div className="p-6 text-sm text-ink-500 text-center">No payments yet</div>
          ) : recentPayments.map((p) => (
            <div key={p.id} className="p-3 flex items-center gap-3">
              <div className={`size-8 rounded-lg grid place-items-center ${p.status === "SUCCEEDED" ? "bg-emerald-100 text-emerald-700" : p.status === "FAILED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                {p.status === "SUCCEEDED" ? <Check size={14} /> : <Coins size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">+{formatCoins(p.coins)} coins · ${(p.amountCents / 100).toFixed(2)} {p.currency}</div>
                <div className="text-xs text-ink-500">{p.provider} · {p.status.toLowerCase()} · {timeAgo(p.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
