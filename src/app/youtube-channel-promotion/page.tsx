import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Channel Promotion — SUB2SUB",
  description: "Promote your YouTube channel and gain real subscribers with SUB2SUB's verified channel promotion campaigns.",
};

export default function YouTubeChannelPromotionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Channel Promotion</h1>
        <p className="text-sm text-ink-500 mt-1">Grow your subscriber base with real, verified channel promotions.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>YouTube channel promotion on SUB2SUB helps creators gain authentic subscribers through verified campaigns. When you launch a subscriber campaign, real creators from our community subscribe to your channel. Each subscription is verified using the YouTube Data API v3, ensuring that the subscriber count you see is genuine and compliant with YouTube&apos;s terms.</p>
        <h2 className="text-lg font-semibold text-ink-900">How Channel Promotion Works</h2>
        <p>Start by linking your YouTube channel via OAuth. Then, create a subscriber campaign with your coin budget. The platform matches your campaign with creators who are actively looking to subscribe. Each subscription is checked via YouTube&apos;s API, so you get real subscribers who have genuinely opted in. No bots, no fake accounts, no risk to your channel.</p>
        <h2 className="text-lg font-semibold text-ink-900">Why Real Subscribers Matter</h2>
        <p>A subscriber base of real people means higher engagement rates, more comments, and better video performance. YouTube&apos;s algorithm favors channels with genuine engagement. By using SUB2SUB, you build a foundation of real subscribers who are more likely to watch, like, and share your content.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verified subscribers via YouTube Data API v3</li>
          <li>Set campaign budgets with coin packages</li>
          <li>Real-time subscriber count tracking</li>
          <li>No password required — OAuth only</li>
          <li>Safe, compliant with YouTube terms</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Combine With Video Promotion</h2>
        <p>For the best results, combine channel promotion with <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion campaigns</Link>. New subscribers need a reason to stay, so make sure your channel has high-quality content ready. Use our <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">channel growth audit</Link> to identify areas for improvement before launching campaigns.</p>
      </div>
      <div className="text-center">
        <Link href="/pricing" className="btn btn-primary mr-2">Get Coins</Link>
        <Link href="/faq" className="btn btn-secondary">Read FAQ</Link>
      </div>
    </div>
  );
}
