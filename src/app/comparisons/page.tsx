import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comparisons — SUB2SUB",
  description: "Compare YouTube growth methods. SUB2SUB vs Sub4Sub, free subscribers vs paid, and more creator growth comparisons.",
};

export default function ComparisonsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Comparisons</h1>
        <p className="text-sm text-ink-500 mt-1">Understand the differences between YouTube growth methods and tools.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Choosing the right growth strategy for your YouTube channel can be overwhelming. Our comparisons break down the pros and cons of different methods, helping you make informed decisions. Whether you are debating between free and paid subscribers, or wondering if SUB2SUB is safer than traditional sub4sub, our detailed comparisons provide the clarity you need.</p>
        <h2 className="text-lg font-semibold text-ink-900">Featured Comparisons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/sub2sub-vs-sub4sub" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">Sub2Sub vs Sub4Sub</div>
            <div className="text-xs text-ink-500 mt-1">Safety, verification, and long-term growth compared.</div>
          </Link>
          <Link href="/topics/sub2sub-vs-sub4sub-safety-breakdown" className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors">
            <div className="font-semibold">Sub2Sub vs Sub4Sub: Safety Breakdown</div>
            <div className="text-xs text-ink-500 mt-1">Detailed analysis of risks and compliance.</div>
          </Link>
        </div>
        <h2 className="text-lg font-semibold text-ink-900">Why Comparisons Matter</h2>
        <p>Every creator&apos;s situation is unique. A method that works for a gaming channel might not work for an educational channel. By comparing different approaches, you can find the strategy that aligns with your goals, niche, and risk tolerance. SUB2SUB is designed to be the safest, most effective option for most creators, but we encourage you to research and choose what is best for you.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sub2Sub vs Sub4Sub: safety and verification</li>
          <li>Free YouTube subscribers vs paid campaigns</li>
          <li>Organic growth vs boosted campaigns</li>
          <li>YouTube vs TikTok vs Instagram growth</li>
        </ul>
      </div>
      <div className="text-center">
        <Link href="/how-it-works" className="btn btn-secondary mr-2">Learn How SUB2SUB Works</Link>
        <Link href="/login" className="btn btn-primary">Try SUB2SUB Free</Link>
      </div>
    </div>
  );
}
