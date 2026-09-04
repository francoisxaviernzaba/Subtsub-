import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Subscriber Tracker — SUB2SUB",
  description: "Track your YouTube subscriber growth with SUB2SUB's subscriber tracker. Monitor real subscriber gains from verified campaigns.",
};

export default function YouTubeSubscriberTrackerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Subscriber Tracker</h1>
        <p className="text-sm text-ink-500 mt-1">Monitor your subscriber growth and track campaign performance.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>A YouTube subscriber tracker is essential for understanding your channel&apos;s growth trajectory. SUB2SUB provides real-time tracking for all your subscriber campaigns, so you can see exactly how many real subscribers you have gained. Unlike third-party tools that estimate or guess, our tracker is connected to the YouTube Data API v3, giving you accurate, up-to-date data.</p>
        <h2 className="text-lg font-semibold text-ink-900">How the Tracker Works</h2>
        <p>When you launch a subscriber campaign on SUB2SUB, every subscription is verified in real time. The tracker displays your total subscriber gains, campaign progress, and coin expenditure. You can see which campaigns are performing best and adjust your strategy accordingly. This transparency helps you make data-driven decisions to optimize your growth.</p>
        <h2 className="text-lg font-semibold text-ink-900">Why Tracking Matters</h2>
        <p>Tracking your subscriber growth helps you identify what works and what does not. If a particular campaign type or content niche drives more subscribers, you can focus your efforts there. Conversely, if a campaign is underperforming, you can tweak your budget or targeting. Over time, this iterative process leads to more efficient growth.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Real-time subscriber count updates</li>
          <li>Campaign performance analytics</li>
          <li>Verified via YouTube Data API v3</li>
          <li>Historical data to spot trends</li>
          <li>Integrated with coin spending and rewards</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Combining Tracking with Strategy</h2>
        <p>Use the tracker alongside our other tools and guides. Check your <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">channel growth audit</Link> for a comprehensive overview. Follow our <Link href="/topics/youtube-subscriber-booster-guide" className="text-brand-500 hover:underline">subscriber booster guide</Link> to improve retention, and use the tracker to measure the impact of your changes.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Track Your Growth</Link>
      </div>
    </div>
  );
}
