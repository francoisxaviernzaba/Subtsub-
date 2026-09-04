import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides — SUB2SUB",
  description: "Step-by-step guides for YouTube creators. Learn how to grow your channel, increase watch time, and earn more.",
};

export default function GuidesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Guides</h1>
        <p className="text-sm text-ink-500 mt-1">Step-by-step resources to help you grow your YouTube channel.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Our guides are designed to take you from beginner to pro. Each guide breaks down complex topics into actionable steps, with real examples and practical tips. Whether you are trying to reach 4000 watch hours, optimize your thumbnails, or understand the YouTube algorithm, our guides provide the roadmap you need.</p>
        <h2 className="text-lg font-semibold text-ink-900">Popular Guides</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/topics/youtube-subscriber-booster-guide" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Subscriber Booster Guide</div>
            <div className="text-xs text-ink-500 mt-1">Boost your subscriber count with proven strategies.</div>
          </Link>
          <Link href="/topics/youtube-views-booster-retention-strategy" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">Views Booster & Retention Strategy</div>
            <div className="text-xs text-ink-500 mt-1">Increase views and keep viewers watching longer.</div>
          </Link>
          <Link href="/topics/youtube-monetization-4000-watch-hours-blueprint" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">4000 Watch Hours Blueprint</div>
            <div className="text-xs text-ink-500 mt-1">A step-by-step plan to reach monetization.</div>
          </Link>
          <Link href="/topics/youtube-shorts-viral-algorithm-formula" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">Shorts Viral Algorithm Formula</div>
            <div className="text-xs text-ink-500 mt-1">Crack the Shorts algorithm for viral growth.</div>
          </Link>
          <Link href="/topics/youtube-algorithm-secrets-deep-dive" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">YouTube Algorithm Secrets</div>
            <div className="text-xs text-ink-500 mt-1">Understand how YouTube ranks and recommends.</div>
          </Link>
          <Link href="/topics/youtube-ctr-thumbnail-title-optimization" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">CTR & Thumbnail Optimization</div>
            <div className="text-xs text-ink-500 mt-1">Create thumbnails and titles that get clicks.</div>
          </Link>
        </div>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <h2 className="text-lg font-semibold text-ink-900">Tools to Accelerate Growth</h2>
        <p>Guides provide the knowledge, but tools provide the execution. SUB2SUB offers free tools like the <Link href="/tools/watch-time-calculator" className="text-brand-500 hover:underline">watch time calculator</Link>, <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link>, and <Link href="/tools/views-to-watch-hours" className="text-brand-500 hover:underline">views to watch hours converter</Link> to help you implement what you learn.</p>
      </div>
      <div className="text-center">
        <Link href="/topics" className="btn btn-secondary mr-2">Browse All Topics</Link>
        <Link href="/login" className="btn btn-primary">Start Growing</Link>
      </div>
    </div>
  );
}
