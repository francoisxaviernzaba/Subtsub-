import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Social Media Growth — SUB2SUB",
  description: "Grow your social media presence across YouTube, Instagram, and TikTok with SUB2SUB's verified creator growth platform.",
};

export default function SocialMediaGrowthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Social Media Growth</h1>
        <p className="text-sm text-ink-500 mt-1">Expand your reach across multiple platforms with real engagement.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Social media growth is no longer limited to a single platform. SUB2SUB supports creators across YouTube, Instagram, and TikTok, helping you build a cross-platform audience. Our video discovery and audience network lets you discover content from creators on all three platforms, while our promotion tools help you boost your own presence where it matters most.</p>
        <h2 className="text-lg font-semibold text-ink-900">Multi-Platform Strategy</h2>
        <p>Each platform has its own algorithm and audience preferences. YouTube rewards watch time and engagement. Instagram thrives on visual content and stories. TikTok favors short, viral clips. SUB2SUB helps you grow across all three by providing verified promotion tools tailored to each platform&apos;s strengths.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>YouTube: video views, watch time, and subscribers</li>
          <li>Instagram: engagement and follower growth</li>
          <li>TikTok: views, likes, and follower expansion</li>
          <li>Cross-platform creator discovery network</li>
          <li>Unified coin economy across all platforms</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Why Diversify</h2>
        <p>Relying on a single platform is risky. Algorithm changes, policy updates, and audience shifts can impact your growth overnight. By building a presence on multiple platforms, you create a more resilient brand. SUB2SUB&apos;s multi-platform approach makes it easy to grow everywhere at once.</p>
        <h2 className="text-lg font-semibold text-ink-900">Getting Started</h2>
        <p>Sign up for free, connect your accounts, and start earning coins by engaging with content. Then, use those coins to promote your videos, posts, or shorts across the platforms you care about. Explore our <Link href="/instagram-growth" className="text-brand-500 hover:underline">Instagram growth</Link> and <Link href="/tiktok-growth" className="text-brand-500 hover:underline">TikTok growth</Link> pages for platform-specific tips.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Start Growing on All Platforms</Link>
      </div>
    </div>
  );
}
