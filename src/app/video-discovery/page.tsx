import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video Discovery and Audience Network — SUB2SUB",
  description: "Discover new YouTube content and grow your audience with SUB2SUB's video discovery network. Real creators, real views, real results.",
};

export default function VideoDiscoveryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Video Discovery and Audience Network</h1>
        <p className="text-sm text-ink-500 mt-1">Find your next favorite creator while growing your own channel.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>SUB2SUB&apos;s video discovery and audience network connects creators with content that matters. Whether you are looking to discover new videos in your niche or promote your own content to an engaged audience, our platform provides the tools and community to make it happen. Every interaction is verified, ensuring that your watch time counts and your subscribers are real.</p>
        <h2 className="text-lg font-semibold text-ink-900">Discover Relevant Content</h2>
        <p>The discovery grid surfaces boosted videos from creators across every niche. Browse categories, watch videos for at least the minimum required duration, and earn coins for every verified watch. This creates a win-win: you discover fresh content while creators get the watch time they need to grow.</p>
        <h2 className="text-lg font-semibold text-ink-900">Build Your Audience Network</h2>
        <p>When you subscribe to boosted channels, you join an active network of creators who support each other. Our subscriber verification system checks every subscription through the YouTube Data API v3, so creators know they are gaining real followers. This network effect drives organic growth across the entire platform.</p>
        <h2 className="text-lg font-semibold text-ink-900">Platform Verification</h2>
        <p>We never ask for your YouTube password. Instead, we use OAuth for read-only access, so your account stays secure. Watch durations are verified server-side, and subscription status is checked via YouTube&apos;s official API. This means no fake views, no ghost subscribers, and no risk to your channel.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Browse boosted videos by category or niche</li>
          <li>Earn coins for verified watch time</li>
          <li>Connect with creators through subscriptions</li>
          <li>Track your watch history and earnings</li>
          <li>Discover trending content across platforms</li>
        </ul>
      </div>
      <div className="text-center">
        <Link href="/how-it-works" className="btn btn-primary mr-2">Learn How It Works</Link>
        <Link href="/login" className="btn btn-secondary">Join the Network</Link>
      </div>
    </div>
  );
}
