import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Channel Growth Audit — SUB2SUB",
  description: "Audit your YouTube channel growth with SUB2SUB's free tool. Identify strengths, weaknesses, and opportunities for improvement.",
};

export default function ChannelGrowthAuditPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Channel Growth Audit</h1>
        <p className="text-sm text-ink-500 mt-1">Analyze your channel and discover growth opportunities.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>A channel growth audit is a comprehensive review of your YouTube channel&apos;s performance, content, and optimization. Our free audit tool helps you identify strengths, weaknesses, and actionable opportunities for growth. Whether you are struggling with low views, poor retention, or slow subscriber growth, the audit provides a clear roadmap for improvement.</p>
        <h2 className="text-lg font-semibold text-ink-900">What the Audit Covers</h2>
        <p>The audit analyzes your channel&apos;s metadata, content strategy, thumbnail and title performance, upload frequency, and audience engagement. It checks for common issues like missing descriptions, poor tagging, and inconsistent branding. The result is a prioritized list of actions you can take to improve your channel&apos;s growth rate.</p>
        <h2 className="text-lg font-semibold text-ink-900">Taking Action on Audit Results</h2>
        <p>After completing the audit, implement the recommended changes. Update your titles with our <Link href="/youtube-title-generator" className="text-brand-500 hover:underline">title generator</Link>, redesign thumbnails with our <Link href="/youtube-thumbnail-maker" className="text-brand-500 hover:underline">thumbnail maker</Link>, and optimize your tags. Then, give your channel a boost with <Link href="/youtube-video-promotion" className="text-brand-500 hover:underline">video promotion campaigns</Link> to accelerate growth.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Comprehensive channel analysis</li>
          <li>Prioritized growth recommendations</li>
          <li>Free and easy to use</li>
          <li>Identify SEO and content gaps</li>
          <li>Track improvements over time</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Continuous Improvement</h2>
        <p>Growth is not a one-time event. Run the audit regularly to track your progress and adjust your strategy. Combine audit insights with our <Link href="/guides" className="text-brand-500 hover:underline">creator guides</Link> and <Link href="/tools" className="text-brand-500 hover:underline">free tools</Link> for a holistic approach to channel growth.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Run Your Free Audit</Link>
      </div>
    </div>
  );
}
