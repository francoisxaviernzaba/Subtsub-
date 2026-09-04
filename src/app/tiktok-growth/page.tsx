import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Growth — SUB2SUB",
  description: "Grow your TikTok account with SUB2SUB's social media growth tools. Real views, real followers, real engagement.",
};

export default function TikTokGrowthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">TikTok Growth</h1>
        <p className="text-sm text-ink-500 mt-1">Go viral and build a loyal TikTok audience.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>TikTok growth can be explosive when you understand the algorithm. SUB2SUB helps you get the initial views and engagement your shorts need to trigger the algorithm. Our platform rewards real engagement, so your views and followers come from genuine users who are interested in your content. This increases your chances of going viral and building a sustainable TikTok presence.</p>
        <h2 className="text-lg font-semibold text-ink-900">How TikTok Growth Works</h2>
        <p>Create a TikTok promotion campaign with SUB2SUB and spend coins to boost your short videos. Real creators will watch your videos, like them, and follow your account. Because every action is verified, your growth is safe and authentic. High engagement rates signal quality to TikTok&apos;s algorithm, increasing the likelihood that your content will appear on more For You pages.</p>
        <h2 className="text-lg font-semibold text-ink-900">Tips for TikTok Success</h2>
        <p>Keep your videos short and engaging. The first few seconds are critical — hook viewers immediately. Use trending sounds and hashtags to increase discoverability. Post consistently and engage with comments to build a loyal community. For more strategies, check out our <Link href="/topics/youtube-shorts-viral-algorithm-formula" className="text-brand-500 hover:underline">viral algorithm formula</Link>, which applies to short-form content across platforms.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Promote shorts and long-form videos</li>
          <li>Verified views and engagement</li>
          <li>Coin-based campaigns for sustainable growth</li>
          <li>Cross-platform discovery with YouTube and Instagram</li>
          <li>Free tools to optimize your content</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Combine Platforms for Maximum Impact</h2>
        <p>Many creators cross-post to YouTube Shorts, Instagram Reels, and TikTok simultaneously. SUB2SUB supports all three, so you can grow your audience everywhere at once. Explore our <Link href="/social-media-growth" className="text-brand-500 hover:underline">social media growth</Link> page to learn how to build a cohesive cross-platform strategy.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Boost Your TikTok</Link>
      </div>
    </div>
  );
}
