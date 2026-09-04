import { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Pricing — Sub2Sub",
  description: "Coin packages for YouTube creator growth. Start free with 100 coins.",
};

export default async function PricingPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-sm text-ink-500 mt-1">Start free with 100 coins. No subscription required.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.coinPackages.map((pkg, i) => (
          <div key={pkg.coins} className="card p-5 flex flex-col relative">
            {pkg.coins >= 12000 && (
              <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">RECOMMENDED</div>
            )}
            <div className="text-xs text-ink-500">{pkg.coins >= 1000 ? `${(pkg.coins / 1000).toFixed(1)}K` : pkg.coins} coins</div>
            <div className="mt-1 text-3xl font-extrabold">${(pkg.amountCents / 100).toFixed(2)}</div>
            <div className="text-sm text-ink-500">{(pkg.amountCents / 100) / Math.max(1, pkg.coins) < 0.001 ? `\${((pkg.amountCents / 100) / Math.max(1, pkg.coins)).toFixed(4)}/coin` : ""}</div>
            <Link href="/login" className="btn btn-primary mt-4">Get coins</Link>
          </div>
        ))}
      </div>
      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold">How coins work</h2>
        <div className="text-sm text-ink-500 space-y-2">
          <p>• <strong>Watch videos</strong> — earn {settings.viewRewardCoins} coins per verified watch</p>
          <p>• <strong>Subscribe</strong> — earn {settings.subscribeRewardCoins} coins per verified subscription</p>
          <p>• <strong>Promote</strong> — spend coins to boost your videos and channel</p>
          <p>• <strong>Free bonus</strong> — {settings.welcomeCoins} coins when you sign up</p>
        </div>
      </div>
    </div>
  );
}
