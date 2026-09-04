import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Sub2Sub",
  description: "Sub2Sub is a verified creator growth and video discovery platform for YouTube creators.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">About Sub2Sub</h1>
        <p className="text-sm text-ink-500 mt-1">Real creator growth. Real discovery. Real results.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Sub2Sub (2Sub) is a verified creator growth and video discovery platform built to help digital creators grow their YouTube channels through authentic engagement.</p>
        <p>Our platform connects creators who want to discover new content with creators who want to promote their content. Every interaction is verified through the official YouTube Data API v3 to ensure real watch time and genuine subscriptions.</p>
        <h2 className="text-lg font-semibold text-ink-900">Our Mission</h2>
        <p>We believe in responsible creator growth. Unlike artificial engagement services that use bots and fake accounts, Sub2Sub creates a sustainable ecosystem where creators support each other with real views, real watch time, and real subscribers.</p>
        <h2 className="text-lg font-semibold text-ink-900">How We Verify</h2>
        <p>Every watch is verified for minimum duration. Every subscription is checked via YouTube&apos;s API. We never ask for your YouTube password — only OAuth read-only access.</p>
        <h2 className="text-lg font-semibold text-ink-900">Platform Features</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Video view campaigns with verified watch duration</li>
          <li>Subscriber campaigns with real API verification</li>
          <li>Coin-based economy for fair exchange</li>
          <li>Daily quests, streaks, and leaderboards</li>
          <li>Multi-platform discovery (YouTube, TikTok, Instagram)</li>
          <li>Free creator tools and calculators</li>
        </ul>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Join Sub2Sub Free</Link>
      </div>
    </div>
  );
}
