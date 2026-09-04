import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Topics — SUB2SUB",
  description: "Browse all topics on SUB2SUB. YouTube growth guides, comparisons, and creator resources.",
};

export default function TopicsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Topics</h1>
        <p className="text-sm text-ink-500 mt-1">Explore our collection of YouTube growth topics and resources.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Our topics cover everything you need to know about growing your YouTube channel. From subscriber strategies to watch time optimization, from algorithm insights to monetization blueprints, each topic is designed to help you succeed as a creator. Dive into the guides below to build your knowledge and take actionable steps toward channel growth.</p>
        <h2 className="text-lg font-semibold text-ink-900">Featured Topics</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/topics/youtube-subscriber-booster-guide" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Subscriber Booster Guide</div>
            <div className="text-xs text-ink-500 mt-1">Strategies to boost your subscriber count safely.</div>
          </Link>
          <Link href="/topics/youtube-views-booster-retention-strategy" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Views Booster & Retention Strategy</div>
            <div className="text-xs text-ink-500 mt-1">Get more views and keep viewers watching.</div>
          </Link>
          <Link href="/topics/youtube-monetization-4000-watch-hours-blueprint" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Monetization Blueprint</div>
            <div className="text-xs text-ink-500 mt-1">Reach 4000 watch hours and start earning.</div>
          </Link>
          <Link href="/topics/youtube-shorts-viral-algorithm-formula" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Shorts Viral Algorithm Formula</div>
            <div className="text-xs text-ink-500 mt-1">Understand and hack the Shorts algorithm.</div>
          </Link>
          <Link href="/topics/sub2sub-vs-sub4sub-safety-breakdown" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">Sub2Sub vs Sub4Sub Safety Breakdown</div>
            <div className="text-xs text-ink-500 mt-1">Why SUB2SUB is safer for your channel.</div>
          </Link>
          <Link href="/topics/youtube-algorithm-secrets-deep-dive" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Algorithm Secrets Deep Dive</div>
            <div className="text-xs text-ink-500 mt-1">Learn how YouTube ranks and recommends videos.</div>
          </Link>
        </div>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <h2 className="text-lg font-semibold text-ink-900">More Topics</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/topics/youtube-monetization-africa-mobile-money" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Monetization in Africa</div>
            <div className="text-xs text-ink-500 mt-1">Mobile money and regional monetization tips.</div>
          </Link>
          <Link href="/topics/youtube-ctr-thumbnail-title-optimization" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">CTR, Thumbnail & Title Optimization</div>
            <div className="text-xs text-ink-500 mt-1">Improve click-through rates with better thumbnails.</div>
          </Link>
        </div>
      </div>
      <div className="text-center">
        <Link href="/guides" className="btn btn-secondary mr-2">Browse Guides</Link>
        <Link href="/comparisons" className="btn btn-secondary">View Comparisons</Link>
      </div>
    </div>
  );
}
