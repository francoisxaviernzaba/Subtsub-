import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Video Promotion Campaigns — SUB2SUB",
  description: "Run YouTube video promotion campaigns with real watch time. Boost your videos with verified views from active creators.",
};

export default function YouTubeVideoPromotionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Video Promotion Campaigns</h1>
        <p className="text-sm text-ink-500 mt-1">Get real watch time and views for your YouTube videos.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>YouTube video promotion campaigns are one of the most effective ways to boost your content on SUB2SUB. Instead of spending money on uncertain ads, you spend coins to get verified watch time from real creators. Each viewer watches your video for a minimum duration, and the watch time is verified server-side through the YouTube Data API v3. This means your view count increases with genuine engagement.</p>
        <h2 className="text-lg font-semibold text-ink-900">How Video Campaigns Work</h2>
        <p>Create a campaign by pasting your YouTube video URL and setting your coin budget. The platform then distributes your video to creators in the discovery grid. Each creator watches your video for the required minimum duration, and you receive verified watch time. You can set a maximum number of views and track your campaign progress in real time.</p>
        <h2 className="text-lg font-semibold text-ink-900">Benefits of Verified Watch Time</h2>
        <p>Verified watch time signals quality to YouTube&apos;s algorithm. When real users watch your videos, YouTube notices the engagement, which can improve your video&apos;s ranking in search results and recommendations. Unlike bot views that get flagged and removed, SUB2SUB&apos;s verified watch time is safe and sustainable.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Set custom coin budgets and view targets</li>
          <li>Verified watch duration per view</li>
          <li>Real-time campaign analytics</li>
          <li>Safe, YouTube-compliant promotion</li>
          <li>Instant campaign activation after coin deduction</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Maximizing Your Results</h2>
        <p>Combine video promotion with strong thumbnails, compelling titles, and valuable content. SUB2SUB gives you the initial watch time boost, but long-term growth comes from content that keeps viewers watching. Explore our <Link href="/topics/youtube-views-booster-retention-strategy" className="text-brand-500 hover:underline">retention strategies</Link> to learn how to turn those views into loyal subscribers.</p>
      </div>
      <div className="text-center">
        <Link href="/pricing" className="btn btn-primary mr-2">View Coin Packages</Link>
        <Link href="/how-it-works" className="btn btn-secondary">See How It Works</Link>
      </div>
    </div>
  );
}
