import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Growth Strategies — SUB2SUB",
  description: "Proven YouTube growth strategies to increase subscribers, watch time, and engagement. Start your journey with SUB2SUB today.",
};

export default function YouTubeGrowthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Growth Strategies</h1>
        <p className="text-sm text-ink-500 mt-1">Proven methods to grow your channel, increase watch time, and build a loyal audience.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Growing a YouTube channel requires a combination of content strategy, audience engagement, and smart promotion. At SUB2SUB, we believe in sustainable YouTube growth that respects both creators and viewers. Our platform provides the tools to boost your watch time and gain real subscribers, while our guides help you refine your content strategy for long-term success.</p>
        <h2 className="text-lg font-semibold text-ink-900">Core Growth Strategies</h2>
        <p>Consistency is the foundation of YouTube growth. Upload on a regular schedule so your audience knows when to expect new content. Optimize your titles and thumbnails to improve click-through rates. Use relevant tags and descriptions to help YouTube understand your content. And most importantly, create content that provides value — whether that is entertainment, education, or inspiration.</p>
        <h2 className="text-lg font-semibold text-ink-900">Leveraging Verified Watch Time</h2>
        <p>Watch time is one of the most important ranking factors on YouTube. SUB2SUB helps you increase watch time through verified view campaigns. Real creators watch your videos for a minimum duration, and every minute is confirmed by the YouTube Data API. This boosts your total watch time and signals quality to YouTube&apos;s algorithm.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload consistently on a fixed schedule</li>
          <li>Optimize titles, thumbnails, and descriptions</li>
          <li>Use verified watch time campaigns to boost metrics</li>
          <li>Engage with your audience through comments and community posts</li>
          <li>Analyze performance with YouTube Studio and our tools</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Tools for Growth</h2>
        <p>SUB2SUB offers a suite of free tools to support your growth journey. Use our <Link href="/tools/watch-time-calculator" className="text-brand-500 hover:underline">watch time calculator</Link> to estimate how much watch time you need for monetization. Try the <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link> to craft compelling titles that drive clicks. And check out our <Link href="/tools/4000-watch-hours-planner" className="text-brand-500 hover:underline">4000 watch hours planner</Link> to map out your path to the Partner Program.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary mr-2">Start Growing</Link>
        <Link href="/guides" className="btn btn-secondary">Browse Guides</Link>
      </div>
    </div>
  );
}
