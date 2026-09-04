import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Shorts Upload Guide — SUB2SUB",
  description: "Learn how to upload YouTube Shorts effectively. Tips for vertical video, titles, tags, and algorithm optimization.",
};

export default function YouTubeShortsUploadPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Shorts Upload</h1>
        <p className="text-sm text-ink-500 mt-1">Master the art of uploading Shorts for maximum reach and growth.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Uploading YouTube Shorts is one of the fastest ways to grow your channel. Shorts are vertical videos under 60 seconds that appear in a dedicated feed, giving creators the chance to reach millions of viewers. However, simply uploading a short is not enough. You need to optimize your upload for the Shorts algorithm to maximize views and engagement.</p>
        <h2 className="text-lg font-semibold text-ink-900">How to Upload Shorts</h2>
        <p>Uploading Shorts is simple. Use the YouTube mobile app or desktop and select &quot;Short&quot; when uploading a vertical video under 60 seconds. Add a compelling title, relevant tags, and a description. The first few frames are critical — hook viewers immediately to increase watch time. You can also cross-post to TikTok and Instagram Reels to maximize your reach.</p>
        <h2 className="text-lg font-semibold text-ink-900">Optimizing for the Shorts Algorithm</h2>
        <p>The Shorts algorithm prioritizes watch time, engagement, and viewer satisfaction. Create content that is entertaining, informative, or emotionally resonant. Use trending sounds and hashtags to increase discoverability. Post consistently and respond to comments to build a loyal audience. For a deep dive into the algorithm, see our <Link href="/topics/youtube-shorts-viral-algorithm-formula" className="text-brand-500 hover:underline">viral algorithm formula</Link>.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vertical video format under 60 seconds</li>
          <li>Hook viewers in the first 3 seconds</li>
          <li>Use trending sounds and hashtags</li>
          <li>Optimize titles with our <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link></li>
          <li>Promote with verified view campaigns</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Boost Your Shorts Performance</h2>
        <p>Give your Shorts an initial boost with SUB2SUB&apos;s video promotion campaigns. Real creators will watch your shorts, increasing your view count and signaling quality to the algorithm. Combine this with strong thumbnails and titles for the best results. Explore our <Link href="/youtube-views" className="text-brand-500 hover:underline">YouTube views</Link> page to learn more.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Start Uploading Shorts</Link>
      </div>
    </div>
  );
}
