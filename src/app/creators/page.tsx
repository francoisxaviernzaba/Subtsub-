import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creators — SUB2SUB",
  description: "Discover top creators on SUB2SUB. Meet kailjeze and other YouTube creators growing their channels with verified engagement.",
};

export default function CreatorsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Creators</h1>
        <p className="text-sm text-ink-500 mt-1">Top creators growing their channels with SUB2SUB.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>SUB2SUB is home to thousands of creators who are growing their YouTube channels through authentic engagement. Our community includes vloggers, educators, gamers, musicians, and entrepreneurs from every niche. By supporting each other through verified watch time and real subscriptions, our creators achieve sustainable growth that lasts.</p>
        <h2 className="text-lg font-semibold text-ink-900">Featured Creator: kailjeze</h2>
        <p>kailjeze is a standout creator on SUB2SUB, known for consistent content and active community participation. By leveraging verified watch time campaigns and engaging with other creators, kailjeze has built a loyal audience and achieved significant channel milestones. Check out the <Link href="/creators/kailjeze" className="text-brand-500 hover:underline">kailjeze profile</Link> to learn more about their journey and strategies.</p>
        <h2 className="text-lg font-semibold text-ink-900">Why Creators Choose SUB2SUB</h2>
        <p>Unlike traditional growth methods that rely on bots or risky exchanges, SUB2SUB offers a safe, verified approach. Creators earn coins by supporting each other, then spend those coins to promote their own content. This creates a virtuous cycle where everyone benefits. Our daily quests, streaks, and leaderboards add a gamified element that keeps the community active and engaged.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verified watch time and subscriptions</li>
          <li>Coin-based economy for fair exchange</li>
          <li>Daily quests and streak bonuses</li>
          <li>Leaderboards and gamification</li>
          <li>Multi-platform support (YouTube, TikTok, Instagram)</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Join the Community</h2>
        <p>Whether you are a new creator just starting out or an established channel looking to accelerate growth, SUB2SUB has the tools and community to help you succeed. Sign up today, connect your channel, and start earning coins. Then, use our creator campaigns to boost your videos and grow your audience.</p>
      </div>
      <div className="text-center">
        <Link href="/creators/kailjeze" className="btn btn-primary mr-2">View kailjeze Profile</Link>
        <Link href="/login" className="btn btn-secondary">Join SUB2SUB</Link>
      </div>
    </div>
  );
}
