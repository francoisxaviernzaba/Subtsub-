import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Watch Time Calculator — SUB2SUB",
  description: "Calculate your YouTube watch time with SUB2SUB's free calculator. Estimate hours needed for monetization and track your progress.",
};

export default function WatchTimeCalculatorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Watch Time Calculator</h1>
        <p className="text-sm text-ink-500 mt-1">Estimate your YouTube watch hours and plan your path to monetization.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Understanding your watch time is critical for YouTube growth. The Watch Time Calculator helps you estimate how many hours of content you need, how long it will take to reach your goals, and what impact changes to your upload frequency or video length will have. Use this tool to plan your content calendar and set realistic targets for reaching 4000 watch hours.</p>
        <h2 className="text-lg font-semibold text-ink-900">How to Use the Calculator</h2>
        <p>Input your current watch hours, average view duration, and weekly upload frequency. The calculator will estimate how many weeks or months it will take to reach 4000 watch hours. You can also experiment with different video lengths and upload schedules to find the most efficient path to monetization.</p>
        <h2 className="text-lg font-semibold text-ink-900">Boosting Watch Time with Campaigns</h2>
        <p>While organic growth is ideal, verified watch time campaigns can accelerate your progress. SUB2SUB&apos;s video promotion campaigns deliver real watch minutes from genuine viewers, directly contributing to your total. Combine calculated planning with strategic promotion to reach your goals faster.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Estimate time to 4000 watch hours</li>
          <li>Model different upload frequencies</li>
          <li>Free and easy to use</li>
          <li>Plan content calendars with data</li>
          <li>Combine with video promotion for faster results</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Related Tools</h2>
        <p>Check out our <Link href="/tools/4000-watch-hours-planner" className="text-brand-500 hover:underline">4000 watch hours planner</Link> for a more comprehensive monetization roadmap, and our <Link href="/tools/views-to-watch-hours" className="text-brand-500 hover:underline">views to watch hours converter</Link> to estimate watch time from view counts.</p>
      </div>
      <div className="text-center">
        <Link href="/tools/4000-watch-hours-planner" className="btn btn-secondary mr-2">Plan Monetization</Link>
        <Link href="/login" className="btn btn-primary">Start Earning Coins</Link>
      </div>
    </div>
  );
}
