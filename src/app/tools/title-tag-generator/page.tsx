import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Title & Tag Generator — SUB2SUB",
  description: "Generate optimized YouTube titles and tags with SUB2SUB's free tool. Improve SEO, CTR, and discoverability.",
};

export default function TitleTagGeneratorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Title & Tag Generator</h1>
        <p className="text-sm text-ink-500 mt-1">Optimize your YouTube SEO with compelling titles and relevant tags.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Optimizing your YouTube titles and tags is one of the most effective ways to improve your video&apos;s discoverability. Our Title & Tag Generator combines two essential SEO tools into one easy-to-use interface. Enter your video topic, and get suggestions for both clickable titles and relevant tags that will help your video rank higher in search and suggested feeds.</p>
        <h2 className="text-lg font-semibold text-ink-900">Title Optimization</h2>
        <p>A great title includes your main keyword, evokes curiosity or emotion, and stays under 60 characters to avoid truncation in search results. Use numbers, brackets, and power words to stand out. Test multiple variations to find the highest CTR. For more title tips, visit our <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link> page.</p>
        <h2 className="text-lg font-semibold text-ink-900">Tag Optimization</h2>
        <p>Tags help YouTube understand your video&apos;s context. Start with your main keyword, then add related terms, synonyms, and long-tail variations. Include tags that describe the content, the audience, and the context. Avoid irrelevant tags — they can hurt performance. For more tag tips, visit our <Link href="/youtube-tag-generator" className="text-brand-500 hover:underline">tag generator</Link> page.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate titles and tags in one place</li>
          <li>SEO-optimized suggestions</li>
          <li>Improve CTR and search ranking</li>
          <li>Free and instant results</li>
          <li>Perfect for creators of all levels</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Complete Your Optimization</h2>
        <p>Titles and tags are just part of the equation. Create matching thumbnails with our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link>, and boost your views with <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion campaigns</Link>. For a full channel review, try our <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">channel growth audit</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/youtube-title-generator" className="btn btn-secondary mr-2">Title Generator</Link>
        <Link href="/youtube-tag-generator" className="btn btn-secondary">Tag Generator</Link>
      </div>
    </div>
  );
}
