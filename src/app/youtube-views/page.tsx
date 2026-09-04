import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get YouTube Views — SUB2SUB",
  description: "Get real YouTube views with SUB2SUB's verified video promotion. Boost your views safely with authentic watch time from real creators.",
};

export default function GetYouTubeViewsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Get YouTube Views</h1>
        <p className="text-sm text-ink-500 mt-1">Real, verified views that help your videos rank higher.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Getting YouTube views is essential for channel growth. Views signal popularity to YouTube&apos;s algorithm, which can lead to more recommendations and higher organic reach. SUB2SUB helps you get real YouTube views through verified video promotion campaigns. Every view is confirmed for minimum watch duration, ensuring that your view count is authentic and valuable.</p>
        <h2 className="text-lg font-semibold text-ink-900">The Importance of Real Views</h2>
        <p>Not all views are created equal. A view from a real person who watches for at least 30 seconds counts as a high-quality view. It contributes to your watch time and signals to YouTube that your content is engaging. Fake views from bots are often filtered out by YouTube and can even trigger penalties. With SUB2SUB, every view is verified and safe.</p>
        <h2 className="text-lg font-semibold text-ink-900">Running a View Campaign</h2>
        <p>To run a view campaign, simply paste your YouTube video URL and set your coin budget. The platform distributes your video to creators in the discovery grid, who watch it for the required minimum duration. You can track your campaign&apos;s progress in real time, seeing exactly how many views and watch hours you have gained.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verified watch duration per view</li>
          <li>Real-time campaign analytics</li>
          <li>Customizable budgets and view targets</li>
          <li>Safe, YouTube-compliant promotion</li>
          <li>Instant activation after coin deduction</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Optimizing for More Views</h2>
        <p>Pair your view campaigns with strong thumbnails and titles. A high click-through rate improves your video&apos;s ranking, while good retention keeps viewers watching. Use our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link> and <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link> to create content that attracts clicks. For more strategies, see our <Link href="/topics/youtube-views-booster-retention-strategy" className="text-brand-500 hover:underline">views and retention strategy guide</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/pricing" className="btn btn-primary mr-2">Get Coins for Views</Link>
        <Link href="/youtube-video-promotion" className="btn btn-secondary">Learn About Video Promotion</Link>
      </div>
    </div>
  );
}
