import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — Sub2Sub",
  description: "Learn how Sub2Sub works: watch, discover, and promote with real creator growth mechanics.",
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How Sub2Sub Works</h1>
        <p className="text-sm text-ink-500 mt-1">Fair, transparent peer discovery powered by coins and verified watch duration.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { title: "Watch & Discover", body: "Explore creator content, discover videos relevant to your interests, and participate in the creator community.", icon: "1" },
          { title: "Discover & Connect", body: "Find creators and channels relevant to your interests or niche and build genuine creator-to-creator connections.", icon: "2" },
          { title: "Promote Your Content", body: "Use available campaign credits to promote eligible content through Sub2Sub&apos;s creator discovery network.", icon: "3" },
        ].map((s) => (
          <div key={s.title} className="card p-5 text-center">
            <div className="size-12 rounded-full bg-brand-500 text-white grid place-items-center text-xl font-extrabold mx-auto mb-3">{s.icon}</div>
            <div className="font-semibold mb-1">{s.title}</div>
            <div className="text-sm text-ink-500">{s.body}</div>
          </div>
        ))}
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Why Sub2Sub is Different</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-ink-500">
          <div className="chip py-2 px-3">100% Real Creators & Viewers</div>
          <div className="chip py-2 px-3">Verified Watch Duration</div>
          <div className="chip py-2 px-3">Responsible Creator Growth</div>
          <div className="chip py-2 px-3">Multi-Platform Discovery</div>
        </div>
        <p className="text-sm text-ink-500">Unlike traditional sub4sub exchanges, Sub2Sub uses real YouTube Data API v3 verification to ensure genuine engagement. Every view is verified for watch duration, and every subscription is checked against YouTube&apos;s official API.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Start Free with 100 Coins</Link>
      </div>
    </div>
  );
}
