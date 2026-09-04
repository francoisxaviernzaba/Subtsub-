import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Title Generator — SUB2SUB",
  description: "Generate high-performing YouTube video titles with SUB2SUB's free title generator. Boost CTR and attract more viewers.",
};

export default function YouTubeTitleGeneratorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Title Generator</h1>
        <p className="text-sm text-ink-500 mt-1">Create clickable, SEO-friendly titles that drive views.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>A great YouTube title can make the difference between a video that gets clicked and one that gets ignored. Our YouTube title generator helps you craft compelling, keyword-rich titles that improve your click-through rate and attract more viewers. Whether you are creating a tutorial, a vlog, or a review, the right title sets expectations and entices clicks.</p>
        <h2 className="text-lg font-semibold text-ink-900">What Makes a Great Title</h2>
        <p>Effective YouTube titles are clear, concise, and curiosity-driven. They include relevant keywords for SEO, evoke emotion, and promise value. Avoid clickbait that does not deliver — YouTube&apos;s algorithm favors videos with high watch time and engagement. Use numbers, brackets, and power words to stand out in crowded feeds.</p>
        <h2 className="text-lg font-semibold text-ink-900">Using the Title Generator</h2>
        <p>Enter your video topic or main keyword, and our generator will suggest multiple title variations. Each suggestion is optimized for search and designed to catch attention. Test different titles on your audience, and use the one with the highest CTR. Pair your title with an equally compelling thumbnail for maximum impact.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Keyword-rich suggestions for SEO</li>
          <li>Curiosity-driven and emotion-evoking formats</li>
          <li>Test variations to find your best performer</li>
          <li>Free and easy to use</li>
          <li>Pairs with our thumbnail maker for full optimization</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Optimize Beyond the Title</h2>
        <p>A great title is just one piece of the puzzle. Optimize your thumbnails with our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link>, use relevant tags, and write detailed descriptions. For comprehensive channel optimization, try our <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">channel growth audit</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/tools/title-tag-generator" className="btn btn-primary mr-2">Try Title Generator</Link>
        <Link href="/youtube-thumbnail-maker" className="btn btn-secondary">Make Thumbnails</Link>
      </div>
    </div>
  );
}
