import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sub4Sub Alternatives · SUB2SUB",
  description: "Discover the best sub4sub alternatives for safe YouTube growth. SUB2SUB offers real API verification and a coin-based economy.",
};

const alternatives = [
  {
    name: "SUB2SUB",
    description: "The safest sub4sub alternative with real YouTube API verification. Earn coins by watching videos and subscribing, then boost your own channel.",
    url: "https://subtsub.vercel.app",
    pros: ["Real YouTube API verification", "Coin-based economy", "Gamification and rewards", "No password required"],
  },
  {
    name: "YouTube SEO",
    description: "Optimize your content for YouTube search. Use relevant keywords, compelling titles, and custom thumbnails.",
    pros: ["Free", "Long-term results", "Builds organic audience"],
  },
  {
    name: "Collaborations",
    description: "Partner with other creators in your niche to expose your channel to new audiences.",
    pros: ["Authentic growth", "Networking opportunities", "Cross-promotion"],
  },
  {
    name: "Social Media Promotion",
    description: "Share your content on Twitter, Instagram, Reddit, and other platforms to drive traffic.",
    pros: ["Wide reach", "Community building", "Free"],
  },
  {
    name: "YouTube Shorts",
    description: "Create short-form content to reach new viewers. Shorts have high discoverability on YouTube.",
    pros: ["High visibility", "Easy to create", "Algorithm-friendly"],
  },
];

export default function AlternativesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Best Sub4Sub Alternatives</h1>
        <p className="text-sm text-ink-500">Safe and effective ways to grow your YouTube channel in 2026.</p>
      </div>
      <div className="space-y-4">
        {alternatives.map((alt, i) => (
          <div key={i} className="card p-5">
            <h2 className="font-semibold text-lg mb-2">{alt.name}</h2>
            <p className="text-sm text-ink-500 mb-3">{alt.description}</p>
            {alt.url && (
              <Link href={alt.url} className="text-sm text-brand-600 hover:underline font-medium">
                Learn more →
              </Link>
            )}
            {alt.pros && (
              <ul className="mt-3 space-y-1">
                {alt.pros.map((pro, j) => (
                  <li key={j} className="text-sm text-ink-500 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand-500 flex-shrink-0" /> {pro}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="card p-6 bg-brand-50 dark:bg-brand-900/20">
        <h2 className="font-semibold text-lg mb-2">Ready to grow your channel?</h2>
        <p className="text-sm text-ink-500 mb-4">Join SUB2SUB today and start earning coins to boost your YouTube presence.</p>
        <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
      </div>
    </div>
  );
}
