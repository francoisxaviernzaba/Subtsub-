import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "4000 Watch Hours Planner — SUB2SUB",
  description: "Plan your path to 4000 YouTube watch hours with SUB2SUB's free planner. Get a monetization roadmap tailored to your channel.",
};

export default function thousandWatchHoursPlannerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">4000 Watch Hours Planner</h1>
        <p className="text-sm text-ink-500 mt-1">A step-by-step plan to reach YouTube monetization.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Reaching 4000 watch hours is a major milestone for any YouTube creator. Our 4000 watch hours planner helps you create a realistic, data-driven roadmap to monetization. By inputting your current metrics and goals, you can visualize exactly what you need to do — more uploads, longer videos, or strategic promotion — to hit the target.</p>
        <h2 className="text-lg font-semibold text-ink-900">How the Planner Works</h2>
        <p>Enter your current watch hours, average video length, and upload frequency. The planner calculates how many additional hours you need and suggests a content plan to close the gap. You can adjust variables to see how increasing your video length or posting more frequently affects your timeline.</p>
        <h2 className="text-lg font-semibold text-ink-900">Accelerating with Verified Watch Time</h2>
        <p>For creators who want to speed up their journey, SUB2SUB offers verified watch time campaigns. These campaigns deliver real watch minutes from genuine viewers, directly contributing to your 4000-hour goal. Use the planner to identify your gap, then launch campaigns to fill it faster.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Input current watch hours and upload frequency</li>
          <li>Get a personalized monetization roadmap</li>
          <li>Adjust variables to optimize your timeline</li>
          <li>Combine with video promotion for faster results</li>
          <li>Free tool for all creators</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Next Steps</h2>
        <p>Once you have your plan, use our <Link href="/tools/watch-time-calculator" className="text-brand-500 hover:underline">watch time calculator</Link> for quick estimates, and explore <Link href="/youtube-growth" className="text-brand-500 hover:underline">YouTube growth strategies</Link> to improve your content. When you are ready to promote, check out our <Link href="/pricing" className="text-brand-500 hover:underline">coin packages</Link>.</p>
      </div>
      <div className="text-center">
        <Link href="/tools/watch-time-calculator" className="btn btn-secondary mr-2">Use Watch Time Calculator</Link>
        <Link href="/login" className="btn btn-primary">Start Planning</Link>
      </div>
    </div>
  );
}
