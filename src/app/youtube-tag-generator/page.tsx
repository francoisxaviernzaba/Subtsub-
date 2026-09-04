import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Tag Generator — SUB2SUB",
  description: "Generate optimized YouTube tags with SUB2SUB's free tag generator. Improve discoverability and SEO for your videos.",
};

export default function YouTubeTagGeneratorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Tag Generator</h1>
        <p className="text-sm text-ink-500 mt-1">Find the best tags to help your videos get discovered.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>YouTube tags help the algorithm understand your video&apos;s content and context. The right tags can improve your video&apos;s discoverability in search and suggested videos. Our YouTube tag generator analyzes your topic and suggests relevant, high-performing tags to include in your video description. This simple step can significantly boost your organic reach.</p>
        <h2 className="text-lg font-semibold text-ink-900">How to Use Tags Effectively</h2>
        <p>Start with your main keyword as the first tag. Then, add related terms, synonyms, and long-tail variations. Include tags that describe the content, the audience, and the context. Avoid irrelevant tags — they can hurt your performance. Use our <Link href="/tools/title-tag-generator" className="text-brand-500 hover:underline">title and tag generator</Link> for a combined approach.</p>
        <h2 className="text-lg font-semibold text-ink-900">Tag Strategy Tips</h2>
        <p>Research what tags top-performing videos in your niche use. Look at their titles and descriptions for inspiration. Mix broad tags with specific, low-competition tags to capture both wide and targeted audiences. Update your tags periodically as trends and search behavior change.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate relevant, SEO-friendly tags</li>
          <li>Mix broad and long-tail keywords</li>
          <li>Free and instant tag suggestions</li>
          <li>Improve search and suggested video placement</li>
          <li>Combine with title optimization for best results</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">More Optimization Tools</h2>
        <p>Tags are just one part of YouTube SEO. Pair them with strong titles using our <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link>, eye-catching thumbnails with our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link>, and strategic campaigns with <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/tools/title-tag-generator" className="btn btn-primary">Generate Tags Now</Link>
      </div>
    </div>
  );
}
