import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Growth & Social Promotion Platform — SUB2SUB",
  description: "Grow your YouTube channel with SUB2SUB's creator growth and social promotion platform. Earn coins, boost videos, and connect with real creators.",
};

export default function CreatorGrowthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Creator Growth & Social Promotion Platform</h1>
        <p className="text-sm text-ink-500 mt-1">Authentic YouTube growth powered by real creators, not bots.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>SUB2SUB is a creator growth and social promotion platform built for YouTube creators who want sustainable, authentic channel growth. Unlike artificial engagement services that rely on bots and fake accounts, our platform connects real creators who support each other through verified watch time, genuine subscriptions, and organic audience discovery.</p>
        <h2 className="text-lg font-semibold text-ink-900">How Creator Growth Works</h2>
        <p>Our coin-based economy creates a fair exchange where creators earn coins by watching boosted videos and subscribing to boosted channels. Every watch is verified for minimum duration using the YouTube Data API v3, and every subscription is confirmed through official API checks. You never share your password — only OAuth read-only access.</p>
        <h2 className="text-lg font-semibold text-ink-900">Social Promotion Features</h2>
        <p>Create video view campaigns or subscriber campaigns to promote your content to an active community of creators. Set your coin budget, and real users will watch your videos or subscribe to your channel. The result is genuine audience growth that respects YouTube&apos;s terms of service.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Video view campaigns with verified watch duration</li>
          <li>Subscriber campaigns with real API verification</li>
          <li>Coin rewards for every completed action</li>
          <li>Daily quests and streak bonuses</li>
          <li>Multi-platform discovery across YouTube, TikTok, and Instagram</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Why Choose SUB2SUB</h2>
        <p>Traditional sub4sub exchanges often violate YouTube&apos;s terms and can put your channel at risk. SUB2SUB uses responsible creator growth mechanics that prioritize real engagement. With verified watch time, authentic subscribers, and a supportive community, your channel grows safely and sustainably.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Start Growing for Free</Link>
      </div>
    </div>
  );
}
