import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Growth — SUB2SUB",
  description: "Grow your Instagram following with SUB2SUB's social media growth tools. Real engagement, real followers, real results.",
};

export default function InstagramGrowthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Instagram Growth</h1>
        <p className="text-sm text-ink-500 mt-1">Build your Instagram audience with real, engaged followers.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Instagram growth is essential for creators, influencers, and businesses looking to expand their reach. SUB2SUB&apos;s social media growth platform includes Instagram, allowing you to discover new accounts and promote your own content to an engaged audience. Our coin-based system rewards genuine engagement and ensures that your growth is authentic and sustainable.</p>
        <h2 className="text-lg font-semibold text-ink-900">How Instagram Growth Works on SUB2SUB</h2>
        <p>Start by signing up and connecting your accounts. Earn coins by engaging with content from other creators on the platform. Then, use those coins to run Instagram promotion campaigns. Real users will follow your account, like your posts, and engage with your stories. The result is a growing follower base that is genuinely interested in your content.</p>
        <h2 className="text-lg font-semibold text-ink-900">Strategies for Instagram Success</h2>
        <p>Consistency and quality are key. Post on a regular schedule, use relevant hashtags, and create visually appealing content. Instagram&apos;s algorithm favors accounts with high engagement rates, so focus on building a community that interacts with your posts. Use our <Link href="/tools/channel-growth-audit" className="text-brand-500 hover:underline">growth audit</Link> to identify opportunities for improvement.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Coin-based promotion for real followers</li>
          <li>Cross-platform discovery network</li>
          <li>Engage with creators across YouTube, Instagram, and TikTok</li>
          <li>Safe, compliant growth methods</li>
          <li>Free tools and guides to optimize your strategy</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Expand Beyond Instagram</h2>
        <p>While Instagram is powerful, combining it with YouTube and TikTok growth creates a more robust online presence. Explore our <Link href="/youtube-growth" className="text-brand-500 hover:underline">YouTube growth strategies</Link> and <Link href="/tiktok-growth" className="text-brand-500 hover:underline">TikTok growth</Link> pages to learn how to maximize your reach across all platforms.</p>
      </div>
      <div className="text-center">
        <Link href="/login" className="btn btn-primary">Grow Your Instagram</Link>
      </div>
    </div>
  );
}
