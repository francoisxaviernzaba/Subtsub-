import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Maker — SUB2SUB",
  description: "Create stunning YouTube thumbnails with SUB2SUB's free thumbnail maker. Boost CTR and get more clicks on your videos.",
};

export default function YouTubeThumbnailMakerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Thumbnail Maker</h1>
        <p className="text-sm text-ink-500 mt-1">Design eye-catching thumbnails that drive clicks and views.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Your YouTube thumbnail is the first thing viewers see. A high-quality, attention-grabbing thumbnail can dramatically increase your click-through rate and help your video stand out in search results and recommendations. SUB2SUB&apos;s free thumbnail maker helps you create professional-looking thumbnails without any design experience.</p>
        <h2 className="text-lg font-semibold text-ink-900">Thumbnail Best Practices</h2>
        <p>Use high-contrast colors and bold text to make your thumbnail pop. Include a clear image of yourself or your subject, and add expressive emotions or reactions. Keep text short and readable — viewers should understand the thumbnail&apos;s message at a glance. Avoid clutter and misleading imagery, as these can hurt your watch time and audience trust.</p>
        <h2 className="text-lg font-semibold text-ink-900">Optimizing for CTR</h2>
        <p>Click-through rate is a key factor in YouTube&apos;s algorithm. Thumbnails that get more clicks signal that your content is appealing. Test different thumbnail styles, colors, and compositions to see what resonates with your audience. Combine your best thumbnails with optimized titles from our <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link> for maximum impact.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Free, easy-to-use thumbnail creation tool</li>
          <li>Templates optimized for YouTube dimensions</li>
          <li>High-contrast colors and bold text options</li>
          <li>Boost CTR and video discoverability</li>
          <li>Pair with title generator for full optimization</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">From Thumbnail to Growth</h2>
        <p>A great thumbnail gets the click, but your content keeps the viewer. Make sure your videos deliver on the promise of your thumbnail. Use our <Link href="/tools/watch-time-calculator" className="text-brand-500 hover:underline">watch time calculator</Link> to estimate how much watch time you need, and launch <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion campaigns</Link> to boost your initial views.</p>
      </div>
      <div className="text-center">
        <Link href="/youtube-title-generator" className="btn btn-secondary mr-2">Generate Titles</Link>
        <Link href="/login" className="btn btn-primary">Start Creating</Link>
      </div>
    </div>
  );
}
