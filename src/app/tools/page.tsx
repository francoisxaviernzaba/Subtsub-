import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free YouTube Tools — SUB2SUB",
  description: "Free YouTube growth tools: watch time calculator, 4000 watch hours planner, views to watch hours converter, RPM calculator, title & tag generator, channel growth audit.",
};

const tools = [
  {
    title: "Watch Time Calculator",
    description: "Calculate how much watch time you need to reach 4000 hours for YouTube monetization.",
    href: "/tools/watch-time-calculator",
    icon: "⏱️",
  },
  {
    title: "4000 Watch Hours Planner",
    description: "Plan your path to 4000 watch hours with a personalized timeline and strategy.",
    href: "/tools/4000-watch-hours-planner",
    icon: "📅",
  },
  {
    title: "Views to Watch Hours Converter",
    description: "Convert view counts to watch hours based on your average view duration.",
    href: "/tools/views-to-watch-hours",
    icon: "👁️",
  },
  {
    title: "YouTube Earnings RPM Calculator",
    description: "Estimate your potential AdSense earnings based on views and RPM.",
    href: "/tools/youtube-earnings-rpm",
    icon: "💰",
  },
  {
    title: "Title & Tag Generator",
    description: "Generate optimized video titles and tags to improve discoverability.",
    href: "/tools/title-tag-generator",
    icon: "🏷️",
  },
  {
    title: "Channel Growth Audit",
    description: "Audit your channel for strengths, weaknesses, and growth opportunities.",
    href: "/tools/channel-growth-audit",
    icon: "📊",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Free YouTube Tools</h1>
        <p className="mt-2 text-sm text-ink-500">
          Plan, calculate, and optimize your channel growth with our free tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card p-5 hover:border-brand-500/30 flex flex-col gap-2"
          >
            <div className="text-2xl">{tool.icon}</div>
            <div className="font-semibold text-sm">{tool.title}</div>
            <div className="text-xs text-ink-500 line-clamp-2">{tool.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
