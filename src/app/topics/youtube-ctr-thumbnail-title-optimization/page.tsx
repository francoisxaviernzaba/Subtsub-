import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube CTR, Thumbnail & Title Optimization — SUB2SUB",
  description: "Optimize your YouTube CTR with better thumbnails and titles. Learn design principles and copywriting tips to get more clicks.",
};

export default function YouTubeCTRThumbnailTitleOptimizationPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CTR, Thumbnail & Title Optimization</h1>
        <p className="text-sm text-ink-500 mt-1">Boost your click-through rate with better thumbnails and titles.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Click-through rate (CTR) is the percentage of people who click on your video after seeing the thumbnail and title. A higher CTR means more views and better performance in YouTube&apos;s algorithm. Optimizing your thumbnails and titles is one of the most effective ways to improve CTR and grow your channel. This guide covers design principles, copywriting tips, and testing strategies.</p>
        <h2 className="text-lg font-semibold text-ink-900">Thumbnail Design Principles</h2>
        <p>Use high-contrast colors and bold text to make your thumbnail stand out. Include a clear image of yourself or your subject, and add expressive emotions. Keep text short — viewers should understand the message at a glance. Avoid clutter and misleading imagery, as these can hurt watch time and trust.</p>
        <h2 className="text-lg font-semibold text-ink-900">Title Copywriting Tips</h2>
        <p>Write titles that evoke curiosity, promise value, or trigger emotion. Use numbers, brackets, and power words. Keep titles under 60 characters to avoid truncation in search results. Include your main keyword for SEO. Test multiple variations to find your best performer.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>High-contrast thumbnails for visual impact</li>
          <li>Short, curiosity-driven titles</li>
          <li>Use our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link> and <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link></li>
          <li>A/B test to find high-performing combinations</li>
          <li>Boost CTR to improve algorithm ranking</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Testing and Iteration</h2>
        <p>CTR optimization is an ongoing process. Test different thumbnail styles, colors, and title formats. Track your CTR in YouTube Studio and identify patterns. Use our <Link href="/tools/title-tag-generator" className="text-brand-500 hover:underline">title and tag generator</Link> to streamline your workflow. Combine strong CTR with verified watch time campaigns for maximum growth.</p>
      </div>
      <div className="text-center">
        <Link href="/youtube-thumbnail-maker" className="btn btn-secondary mr-2">Make Thumbnails</Link>
        <Link href="/youtube-title-generator" className="btn btn-secondary">Generate Titles</Link>
      </div>
    </div>
  );
}
