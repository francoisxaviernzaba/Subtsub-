import Link from "next/link";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sub2Sub (2Sub) — #1 Real YouTube Creator Growth & Video Discovery Platform",
  description: "Sub2Sub is the verified creator growth and video discovery platform for YouTube creators. Earn coins, discover creators, promote videos, and grow your channel with real engagement.",
};

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/s2s");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <div className="size-8 rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 grid place-items-center text-white text-sm shadow-glow">S2S</div>
          SUB2SUB
        </Link>
        <Link href="/login" className="btn btn-primary">Get started</Link>
      </header>

      <main className="flex-1">
        <section className="px-5 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Get 100 Free Coins
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-semibold text-ink-800 dark:text-ink-200">
              Creator Growth & Video Discovery Platform
            </p>
            <p className="mt-2 text-lg text-ink-500 max-w-2xl mx-auto">
              Discover relevant creators, promote your content through creator-focused campaigns, and build meaningful audiences across today&apos;s social platforms.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="btn btn-primary h-12 px-6 text-base">Start Free with 100 Coins</Link>
              <Link href="/how-it-works" className="btn btn-outline h-12 px-6 text-base">How Sub2Sub Works</Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-ink-500">
              <span className="chip">100% Real Creators & Viewers</span>
              <span className="chip">Verified Watch Duration</span>
              <span className="chip">Responsible Creator Growth</span>
              <span className="chip">Multi-Platform Discovery</span>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 bg-[rgb(var(--border))]/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-2">Platform Ecosystem</h2>
            <p className="text-center text-ink-500 mb-10">Creator Growth Solutions & Strategies for every platform</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/youtube-growth" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">YouTube Growth Architecture</div>
                <div className="text-xs text-ink-500 mb-3">Content discovery, retention, CTR, publishing consistency.</div>
                <div className="text-xs text-brand-600 font-semibold">Explore YouTube Growth →</div>
              </Link>
              <Link href="/youtube-video-promotion" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Video Promotion</div>
                <div className="text-xs text-ink-500 mb-3">Promote videos through creator-focused discovery campaigns.</div>
                <div className="text-xs text-brand-600 font-semibold">Promote Videos →</div>
              </Link>
              <Link href="/video-discovery" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Audience & Creator Discovery</div>
                <div className="text-xs text-ink-500 mb-3">Discover creators and audiences in a global verified community.</div>
                <div className="text-xs text-brand-600 font-semibold">Explore Discovery Network →</div>
              </Link>
              <Link href="/creator-campaigns" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Creator Campaigns</div>
                <div className="text-xs text-ink-500 mb-3">Launch campaigns with customizable watch durations and live analytics.</div>
                <div className="text-xs text-brand-600 font-semibold">View Campaigns →</div>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-2">Free Creator Tools</h2>
            <p className="text-center text-ink-500 mb-10">Free online utilities for digital creators — no account required</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/tools/watch-time-calculator" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Watch Time Calculator</div>
                <div className="text-xs text-ink-500 mb-2">Convert views and retention into total watch hours, minutes, and days.</div>
                <div className="text-xs text-brand-600 font-semibold">Calculate Watch Time</div>
              </Link>
              <Link href="/tools/4000-watch-hours-planner" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">4,000 Watch Hours Planner</div>
                <div className="text-xs text-ink-500 mb-2">Plan upload pacing and daily watch hours to qualify for YouTube Partner Program.</div>
                <div className="text-xs text-brand-600 font-semibold">Plan 4,000 Hours</div>
              </Link>
              <Link href="/tools/views-to-watch-hours" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Views to Watch Hours</div>
                <div className="text-xs text-ink-500 mb-2">Direct converter from view count with Average View Duration precision.</div>
                <div className="text-xs text-brand-600 font-semibold">Convert Views</div>
              </Link>
              <Link href="/tools/youtube-earnings-rpm" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">YouTube Earnings & RPM</div>
                <div className="text-xs text-ink-500 mb-2">Estimate AdSense revenue, niche RPM benchmarks, and monthly creator income.</div>
                <div className="text-xs text-brand-600 font-semibold">Estimate Earnings</div>
              </Link>
              <Link href="/tools/title-tag-generator" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Video Title & Tag Generator</div>
                <div className="text-xs text-ink-500 mb-2">Generate high-relevance titles, ranking tags, and search-friendly descriptions.</div>
                <div className="text-xs text-brand-600 font-semibold">Generate Tags</div>
              </Link>
              <Link href="/tools/channel-growth-audit" className="card p-5 hover:border-brand-500/30">
                <div className="text-sm font-semibold mb-1">Channel Growth Audit</div>
                <div className="text-xs text-ink-500 mb-2">Review thumbnail contrast, title clarity, upload consistency, and channel structure.</div>
                <div className="text-xs text-brand-600 font-semibold">Run Audit</div>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 bg-[rgb(var(--border))]/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-2">How Sub2Sub Works</h2>
            <p className="text-center text-ink-500 mb-10">Fair, transparent peer discovery powered by coins and verified watch duration</p>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="size-12 rounded-full bg-brand-500 text-white grid place-items-center text-xl font-extrabold mx-auto mb-3">1</div>
                <div className="font-semibold mb-1">Watch & Discover</div>
                <div className="text-sm text-ink-500">Explore creator content, discover videos relevant to your interests, and participate in the creator community.</div>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-full bg-brand-500 text-white grid place-items-center text-xl font-extrabold mx-auto mb-3">2</div>
                <div className="font-semibold mb-1">Discover & Connect</div>
                <div className="text-sm text-ink-500">Find creators and channels relevant to your interests or niche and build genuine creator-to-creator connections.</div>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-full bg-brand-500 text-white grid place-items-center text-xl font-extrabold mx-auto mb-3">3</div>
                <div className="font-semibold mb-1">Promote Your Content</div>
                <div className="text-sm text-ink-500">Use available campaign credits to promote eligible content through Sub2Sub&apos;s creator discovery network.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-2">Creator Safety & Responsible Growth</h2>
            <p className="text-center text-ink-500 mb-10">Learn how legitimate creator discovery differs from artificial engagement, bots, spam, and prohibited growth manipulation.</p>
            <div className="text-center">
              <Link href="/community-guidelines" className="btn btn-primary">Safety & Standards →</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-10 text-center text-xs text-ink-500 border-t border-[rgb(var(--border))]">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/faq" className="hover:text-brand-600">FAQ</Link>
            <Link href="/terms" className="hover:text-brand-600">Terms</Link>
            <Link href="/privacy" className="hover:text-brand-600">Privacy</Link>
            <Link href="/refund" className="hover:text-brand-600">Refund</Link>
            <Link href="/community-guidelines" className="hover:text-brand-600">Community Guidelines</Link>
            <Link href="/contact" className="hover:text-brand-600">Contact</Link>
            <Link href="/account-deletion" className="hover:text-brand-600">Account Deletion</Link>
          </div>
          <div>© SUB2SUB — Creator Growth & Video Discovery Platform</div>
        </div>
      </footer>
    </div>
  );
}
