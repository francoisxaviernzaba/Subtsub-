import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog · SUB2SUB",
  description: "Tips, guides, and insights for YouTube creators looking to grow their channel.",
};

const posts = [
  {
    slug: "how-sub2sub-works",
    title: "How SUB2SUB Works: The Complete Guide",
    excerpt: "Learn how SUB2SUB helps YouTube creators grow their channels through community-powered views and subscriptions.",
    date: "2026-09-03",
    readTime: "5 min read",
  },
  {
    slug: "is-sub4sub-safe",
    title: "Is Sub4Sub Safe? The Truth About YouTube Growth",
    excerpt: "Discover why SUB2SUB is a safe and effective alternative to traditional sub4sub methods.",
    date: "2026-09-03",
    readTime: "4 min read",
  },
  {
    slug: "best-sub4sub-alternatives",
    title: "Best Sub4Sub Alternatives in 2026",
    excerpt: "Looking for safe ways to grow your YouTube channel? Here are the best alternatives to sub4sub.",
    date: "2026-09-03",
    readTime: "6 min read",
  },
  {
    slug: "how-to-get-1000-subscribers",
    title: "How to Get 1000 YouTube Subscribers Fast",
    excerpt: "Proven strategies to reach your first 1000 subscribers on YouTube using community growth tactics.",
    date: "2026-09-03",
    readTime: "7 min read",
  },
  {
    slug: "youtube-algorithm-tips",
    title: "YouTube Algorithm Tips: What Works in 2026",
    excerpt: "Understanding the YouTube algorithm is key to growth. Learn the latest tips and tricks.",
    date: "2026-09-03",
    readTime: "5 min read",
  },
  {
    slug: "increase-youtube-views-organically",
    title: "How to Increase YouTube Views Organically",
    excerpt: "Discover proven methods to increase your YouTube views without buying bots or violating terms of service.",
    date: "2026-09-03",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Blog</h1>
        <p className="text-sm text-ink-500">Tips, guides, and insights for YouTube creators.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-5 hover:border-brand-200 transition-colors">
            <div className="text-xs text-ink-500 mb-2">{post.date} · {post.readTime}</div>
            <h2 className="font-semibold text-base mb-2">{post.title}</h2>
            <p className="text-sm text-ink-500 line-clamp-2">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
