import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Algorithm Secrets Deep Dive — SUB2SUB",
  description: "Discover how the YouTube algorithm works. Learn ranking signals, watch time importance, and how to get more views and subscribers.",
};

export default function YouTubeAlgorithmSecretsDeepDivePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Algorithm Secrets Deep Dive</h1>
        <p className="text-sm text-ink-500 mt-1">Understand how YouTube ranks videos and recommends content.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>The YouTube algorithm is a complex system that determines which videos get recommended and which get lost. While the exact algorithm is a closely guarded secret, we know the key ranking signals: watch time, click-through rate, engagement, and viewer satisfaction. Understanding these signals helps you create content that performs well and grows your channel.</p>
        <h2 className="text-lg font-semibold text-ink-900">Key Ranking Signals</h2>
        <p><strong>Watch time</strong> is the total minutes viewers spend watching your videos. It is one of the most important ranking factors. <strong>CTR (click-through rate)</strong> measures how often people click on your video after seeing the thumbnail and title. <strong>Engagement</strong> includes likes, comments, shares, and saves. <strong>Viewer satisfaction</strong> is measured through surveys, repeat views, and session time.</p>
        <h2 className="text-lg font-semibold text-ink-900">How the Algorithm Recommends Videos</h2>
        <p>YouTube uses a two-step process: candidate generation and ranking. First, it narrows down hundreds of millions of videos to a few hundred that might be relevant to the viewer. Then, it ranks those videos based on the signals above. The top results appear in the recommended feed, search results, and homepage.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Watch time is the #1 ranking factor</li>
          <li>CTR determines initial impression performance</li>
          <li>Engagement signals content quality</li>
          <li>Viewer satisfaction drives long-term growth</li>
          <li>Verified watch time campaigns boost signals</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Winning the Algorithm</h2>
        <p>Create content that keeps viewers watching. Use strong titles and thumbnails to improve CTR. Encourage engagement by asking questions and responding to comments. Use our <Link href="/tools/watch-time-calculator" className="text-brand-500 hover:underline">watch time calculator</Link> to plan your content, and boost your signals with <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion campaigns</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/youtube-growth" className="btn btn-secondary mr-2">Growth Strategies</Link>
        <Link href="/login" className="btn btn-primary">Start Growing</Link>
      </div>
    </div>
  );
}
