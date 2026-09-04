import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is Sub4Sub? — SUB2SUB",
  description: "Learn what Sub4Sub is, how it compares to SUB2SUB, and why verified creator growth is safer for your YouTube channel.",
};

export default function Sub4SubPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">What is Sub4Sub?</h1>
        <p className="text-sm text-ink-500 mt-1">Understanding the traditional method and its risks.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Sub4Sub, short for &quot;subscribe for subscribe,&quot; is a traditional method where creators agree to subscribe to each other&apos;s channels in exchange for a subscription back. While it seems like a simple way to grow your subscriber count, sub4sub comes with significant risks. Many participants unsubscribe after a short period, leading to high churn rates. Worse, mass sub4sub exchanges can trigger YouTube&apos;s spam detection systems.</p>
        <h2 className="text-lg font-semibold text-ink-900">The Risks of Sub4Sub</h2>
        <p>Traditional sub4sub often lacks verification. Creators subscribe and then quickly unsubscribe, or they use fake accounts to inflate numbers. These fake subscribers lower your engagement rate, which hurts your video performance. YouTube&apos;s algorithm favors channels with high engagement and low churn. A channel with thousands of fake subscribers will see poor reach and may even be penalized.</p>
        <h2 className="text-lg font-semibold text-ink-900">Sub2Sub: A Safer Alternative</h2>
        <p>SUB2SUB reimagines the concept of sub4sub by adding verification, transparency, and safety. Every subscription is verified through the YouTube Data API v3, meaning you get real subscribers who genuinely want to follow your channel. Watch times are also verified, so you earn coins only for legitimate engagement. This creates a sustainable growth model that respects YouTube&apos;s terms.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verified subscriptions via YouTube API</li>
          <li>Real watch time with server-side verification</li>
          <li>Coin-based rewards instead of manual exchanges</li>
          <li>OAuth-only access, no passwords required</li>
          <li>Safe for your channel&apos;s long-term health</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Making the Switch</h2>
        <p>If you have been using traditional sub4sub, switching to SUB2SUB is easy. Sign up with Google, connect your YouTube channel, and start earning coins. You can then spend those coins on verified campaigns that deliver real growth. For a deeper look at the differences, read our <Link href="/sub2sub-vs-sub4sub" className="text-brand-500 hover:underline">Sub2Sub vs Sub4Sub comparison</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Join SUB2SUB</Link>
      </div>
    </div>
  );
}
