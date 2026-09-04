import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get YouTube Subscribers — SUB2SUB",
  description: "Get real YouTube subscribers with SUB2SUB's verified campaigns. Safe, authentic growth that helps your channel thrive.",
};

export default function GetYouTubeSubscribersPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Get YouTube Subscribers</h1>
        <p className="text-sm text-ink-500 mt-1">Authentic subscribers delivered through verified campaigns.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Getting YouTube subscribers is one of the most important goals for any creator. More subscribers means a larger audience for your videos, higher engagement rates, and better performance in YouTube&apos;s algorithm. SUB2SUB helps you get real YouTube subscribers through verified subscriber campaigns. Every subscription is checked via the YouTube Data API v3, so you know you are gaining genuine followers.</p>
        <h2 className="text-lg font-semibold text-ink-900">Why Real Subscribers Matter</h2>
        <p>A subscriber who genuinely wants to follow your channel is far more valuable than a fake account. Real subscribers watch your videos, leave comments, and share your content. This engagement signals quality to YouTube, which can boost your videos into more recommended feeds and search results. Fake subscribers, on the other hand, hurt your engagement rate and can lead to channel penalties.</p>
        <h2 className="text-lg font-semibold text-ink-900">How SUB2SUB Delivers Subscribers</h2>
        <p>Our platform uses a coin-based system where creators earn coins by watching videos and subscribing to channels. They can then spend those coins on your subscriber campaign. Each subscription is verified in real time, so you only pay for genuine results. The process is safe, transparent, and fully compliant with YouTube&apos;s terms of service.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verified subscribers via YouTube Data API v3</li>
          <li>No passwords required — OAuth only</li>
          <li>Set your budget with coin packages</li>
          <li>Real-time tracking of new subscribers</li>
          <li>Safe for long-term channel health</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Tips for Retaining Subscribers</h2>
        <p>Gaining subscribers is only half the battle. To keep them, post content regularly, engage with comments, and use playlists to guide viewers through your channel. Explore our <Link href="/topics/youtube-subscriber-booster-guide" className="text-brand-500 hover:underline">subscriber booster guide</Link> for strategies to turn new subscribers into loyal fans.</p>
      </div>
      <div className="text-center">
        <Link href="/pricing" className="btn btn-primary mr-2">Get Subscribers Now</Link>
        <Link href="/how-it-works" className="btn btn-secondary">Learn More</Link>
      </div>
    </div>
  );
}
