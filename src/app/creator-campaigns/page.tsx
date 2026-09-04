import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Campaigns — SUB2SUB",
  description: "Launch creator campaigns on SUB2SUB to promote your YouTube videos and channels. Real views, real subscribers, real growth.",
};

export default function CreatorCampaignsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Creator Campaigns</h1>
        <p className="text-sm text-ink-500 mt-1">Promote your content with coin-powered campaigns that deliver real results.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Creator campaigns are the heart of SUB2SUB. They allow you to spend coins on promoting your YouTube videos or channel to an active community of real creators. Each campaign is carefully managed to ensure that you get verified watch time or genuine subscribers. Whether you are launching a new video or growing your channel overall, creator campaigns give you the control and transparency you need.</p>
        <h2 className="text-lg font-semibold text-ink-900">Types of Creator Campaigns</h2>
        <p>We offer two main campaign types: video view campaigns and subscriber campaigns. Video view campaigns promote individual videos, delivering verified watch time from real users. Subscriber campaigns promote your entire channel, helping you gain authentic subscribers who are genuinely interested in your content.</p>
        <h2 className="text-lg font-semibold text-ink-900">Setting Up a Campaign</h2>
        <p>Launching a campaign is simple. Navigate to the Boost page, choose your campaign type, paste your YouTube video URL or channel link, and set your coin budget. The platform handles the rest, distributing your campaign to eligible creators and tracking every verified action in real time.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Video view campaigns for individual videos</li>
          <li>Subscriber campaigns for channel growth</li>
          <li>Custom coin budgets and targeting options</li>
          <li>Real-time analytics and progress tracking</li>
          <li>Automatic verification of all actions</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Maximizing Campaign Performance</h2>
        <p>To get the most from your campaigns, ensure your videos have compelling thumbnails and titles. High click-through rates lead to better retention, which in turn improves your video&apos;s performance on YouTube. Explore our <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">channel growth audit</Link> and <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link> tools to optimize your content before promoting.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary mr-2">Start Campaigns</Link>
        <Link href="/pricing" className="btn btn-secondary">Get Coins</Link>
      </div>
    </div>
  );
}
