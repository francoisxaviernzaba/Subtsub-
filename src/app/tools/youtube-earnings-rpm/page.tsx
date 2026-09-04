import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Earnings RPM Calculator — SUB2SUB",
  description: "Estimate your YouTube earnings with SUB2SUB's RPM calculator. Calculate revenue per 1000 views based on your niche and audience.",
};

export default function YouTubeEarningsRPMPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">YouTube Earnings RPM Calculator</h1>
        <p className="text-sm text-ink-500 mt-1">Estimate your potential YouTube revenue per 1000 views.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>RPM, or Revenue Per Mille, represents how much you earn for every 1000 views on your videos. RPM varies widely based on niche, audience location, ad format, and seasonality. Our YouTube Earnings RPM Calculator helps you estimate your potential earnings and plan your content strategy around profitable topics.</p>
        <h2 className="text-lg font-semibold text-ink-900">How RPM is Calculated</h2>
        <p>RPM is calculated by dividing your estimated earnings by your total views, then multiplying by 1000. For example, if you earned $50 from 50,000 views, your RPM is $1.00. Some niches, like finance and technology, have higher RPMs than entertainment or gaming. Knowing your niche&apos;s typical RPM helps you set realistic revenue goals.</p>
        <h2 className="text-lg font-semibold text-ink-900">Using the RPM Calculator</h2>
        <p>Input your niche, average views per video, and estimated RPM range. The calculator will project your monthly and annual earnings. Use this data to decide which topics to focus on, how many videos to produce, and whether to pursue brand deals or affiliate marketing in addition to AdSense.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Estimate earnings based on niche and views</li>
          <li>Compare RPM across different content categories</li>
          <li>Plan your content strategy for profitability</li>
          <li>Free and easy to use</li>
          <li>Pair with watch time calculator for full monetization planning</li>
        </ul>
        <h2 className="text-lg font-semibold text-ink-900">Monetization Beyond AdSense</h2>
        <p>While AdSense is the primary monetization method, consider diversifying with affiliate marketing, sponsorships, and merchandise. Use our <Link href="/tools/4000-watch-hours-planner" className="text-brand-500 hover:underline">monetization planner</Link> to create a comprehensive revenue strategy.</p>
      </div>
      <div className="text-center">
        <Link href="/tools/4000-watch-hours-planner" className="btn btn-secondary mr-2">Plan Monetization</Link>
        <Link href="/login" className="btn btn-primary">Start Growing</Link>
      </div>
    </div>
  );
}
