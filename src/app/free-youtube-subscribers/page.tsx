import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free YouTube Subscribers — SUB2SUB",
  description: "Get free YouTube subscribers with SUB2SUB. Earn coins by watching videos and subscribing, then spend them to boost your own channel.",
};

export default function FreeYouTubeSubscribersPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Free YouTube Subscribers</h1>
        <p className="text-sm text-ink-500 mt-1">Earn subscribers without spending money using our coin-based platform.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Who says you need to spend money to get YouTube subscribers? SUB2SUB offers a unique way to earn free subscribers through our coin-based ecosystem. Instead of paying for followers, you earn coins by engaging with other creators&apos; content. Watch videos, subscribe to channels, complete daily quests, and invite friends. Then, spend those coins on subscriber campaigns to grow your own channel.</p>
        <h2 className="text-lg font-semibold text-ink-900">How to Earn Free Subscribers</h2>
        <p>The process is simple. Sign up for free with Google and connect your YouTube channel. You start with 100 welcome coins. Complete tasks in the discovery grid to earn more. Every verified watch earns you coins, and every verified subscription earns you even more. Over time, you can accumulate enough coins to launch subscriber campaigns and get free YouTube subscribers for your own channel.</p>
        <h2 className="text-lg font-semibold text-ink-900">No Bots, No Fake Accounts</h2>
        <p>SUB2SUB is built on verification. Every subscription is checked via the YouTube Data API v3, ensuring that the subscribers you gain are real people. Fake subscribers hurt your engagement rate and can damage your channel. With SUB2SUB, you get authentic growth that respects YouTube&apos;s terms of service.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>100 free welcome coins on signup</li>
          <li>Earn coins by watching and subscribing</li>
          <li>Verified subscribers via YouTube API</li>
          <li>No passwords, OAuth-only access</li>
          <li>Safe, sustainable, and free</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Start Today</h2>
        <p>Ready to grow your channel for free? <Link href="/login" className="text-brand-500 hover:underline">Sign up</Link> today and claim your 100 free coins. Then, explore our <Link href="/how-it-works" className="text-brand-500 hover:underline">How It Works</Link> page to learn how to maximize your earnings. For more tips, check out our <Link href="/guides" className="text-brand-500 hover:underline">creator guides</Link> and <Link href="/youtube-subscribers" className="text-brand-500 hover:underline">subscriber strategies</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Claim 100 Free Coins</Link>
      </div>
    </div>
  );
}
