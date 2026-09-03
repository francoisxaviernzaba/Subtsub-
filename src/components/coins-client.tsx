"use client";

import { useState } from "react";
import { Coins, Check, Loader2 } from "lucide-react";
import { toast } from "./toast";
import { formatCoins, timeAgo } from "@/lib/utils";

type Pkg = { coins: number; amountCents: number; currency: string };
type Payment = { id: string; coins: number; amountCents: number; currency: string; status: string; createdAt: string; provider: string };

export function CoinsClient({ balance, packages, recentPayments }: { balance: number; packages: Pkg[]; recentPayments: Payment[] }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ address?: string; amount?: string; provider?: string } | null>(null);

  async function buy(pkg: Pkg) {
    setBusy(pkg.coins);
    setPaymentDetails(null);
    try {
      const r = await fetch("/api/payments/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ coins: pkg.coins, amountCents: pkg.amountCents, currency: pkg.currency }) });
      const j = await r.json();
      if (!r.ok) { toast({ title: "Purchase failed", description: j?.error?.message, variant: "error" }); return; }
      if (j.mock) {
        toast({ title: `+${j.credited} coins`, description: "Mock purchase credited instantly.", variant: "success" });
        setTimeout(() => location.reload(), 500);
      } else if (j.checkoutAddress) {
        setPaymentDetails({ address: j.checkoutAddress, amount: j.checkoutAmount, provider: j.provider });
        toast({ title: "Payment created", description: "Send crypto to the address below.", variant: "success" });
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
      <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
        <div className="text-sm text-amber-900 dark:text-amber-200">Your balance</div>
        <div className="text-4xl font-extrabold flex items-center gap-2"><Coins /> {formatCoins(balance)}</div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Top up</h2>
        {paymentDetails && (
          <div className="card p-4 mb-4 space-y-2">
            <div className="text-sm font-semibold">Pay with {paymentDetails.provider}</div>
            <div className="text-xs text-ink-500">Send exactly this amount:</div>
            <div className="text-lg font-extrabold">{paymentDetails.amount}</div>
            <div className="text-xs text-ink-500">To this address:</div>
            <div className="font-mono text-xs break-all p-2 bg-[rgb(var(--border))]/40 rounded">{paymentDetails.address}</div>
            <p className="text-xs text-ink-500">Coins will be credited automatically after network confirmation.</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {packages.map((p) => (
            <div key={p.coins} className="card p-4 flex flex-col">
              <div className="text-xs text-ink-500">{p.coins >= 1000 ? `${(p.coins / 1000).toFixed(1)}K` : p.coins} coins</div>
              <div className="mt-1 text-2xl font-extrabold flex items-center gap-1"><Coins className="text-amber-500" size={20} />{formatCoins(p.coins)}</div>
              <div className="text-sm text-ink-500">${(p.amountCents / 100).toFixed(2)} {p.currency}</div>
              <button onClick={() => buy(p)} disabled={busy !== null} className="btn btn-primary mt-3">
                {busy === p.coins ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />} Buy
              </button>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-ink-500 mt-2">Payments are processed by a pluggable provider (mock in this build). Real providers (Stripe etc.) are wired through the same API.</div>
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
