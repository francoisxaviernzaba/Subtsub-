import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Glossary of YouTube Terms — SUB2SUB",
  description: "A comprehensive glossary of YouTube terms every creator should know. From watch time to RPM, understand the language of YouTube growth.",
};

export default function GlossaryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Glossary of YouTube Terms</h1>
        <p className="text-sm text-ink-500 mt-1">Key terms and definitions for YouTube creators.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Understanding YouTube terminology is essential for every creator. From watch time to CTR, RPM to monetization, the platform has its own language. This glossary defines the most important terms you will encounter on your YouTube growth journey. Use it as a reference while you explore our guides, tools, and campaigns.</p>
        <h2 className="text-lg font-semibold text-ink-900">Essential YouTube Terms</h2>
        <div className="space-y-3">
          <div>
            <div className="font-semibold">Watch Time</div>
            <p>The total number of minutes viewers have spent watching your videos. Watch time is one of the most important ranking factors on YouTube. You need 4000 watch hours in the past 12 months to qualify for the Partner Program.</p>
          </div>
          <div>
            <div className="font-semibold">CTR (Click-Through Rate)</div>
            <p>The percentage of people who click on your video after seeing the thumbnail and title. A higher CTR indicates that your content is appealing and relevant to your audience.</p>
          </div>
          <div>
            <div className="font-semibold">RPM (Revenue Per Mille)</div>
            <p>The estimated earnings you receive for every 1000 views. RPM varies based on niche, audience location, and ad format. Use our <Link href="/tools/youtube-earnings-rpm" className="text-brand-500 hover:underline">RPM calculator</Link> to estimate your potential earnings.</p>
          </div>
          <div>
            <div className="font-semibold">Impressions</div>
            <p>The number of times your video thumbnail and title are shown to viewers on YouTube. Impressions are the first step toward getting views.</p>
          </div>
          <div>
            <div className="font-semibold">Sub4Sub</div>
            <p>A traditional practice where creators subscribe to each other&apos;s channels in exchange for a subscription back. Often lacks verification and can harm channel health. Compare with <Link href="/sub2sub-vs-sub4sub" className="text-brand-500 hover:underline">Sub2Sub</Link>.</p>
          </div>
          <div>
            <div className="font-semibold">OAuth</div>
            <p>An authorization protocol that allows apps to access user accounts without requiring passwords. SUB2SUB uses OAuth for read-only access to your YouTube channel, keeping your account secure.</p>
          </div>
          <div>
            <div className="font-semibold">YouTube Data API v3</div>
            <p>The official API that allows developers to access YouTube data. SUB2SUB uses this API to verify watch time and subscriptions, ensuring authentic growth.</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <Link href="/guides" className="btn btn-secondary mr-2">Read Guides</Link>
        <Link href="/faq" className="btn btn-secondary">View FAQ</Link>
      </div>
    </div>
  );
}
