import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines — Sub2Sub",
  description: "Community guidelines and responsible creator growth standards for Sub2Sub.",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Community Guidelines</h1>
      <p className="text-sm text-ink-500">Last updated: September 4, 2026</p>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Sub2Sub is committed to responsible creator growth. These guidelines ensure a safe, fair experience for all creators.</p>
        <h2 className="text-lg font-semibold text-ink-900">1. Authentic Engagement</h2>
        <p>Do not use bots, scripts, or automated tools to earn coins or complete tasks. All engagement must be genuine and human-performed.</p>
        <h2 className="text-lg font-semibold text-ink-900">2. Respect Other Creators</h2>
        <p>Treat all creators with respect. Do not harass, spam, or engage in abusive behavior toward other users.</p>
        <h2 className="text-lg font-semibold text-ink-900">3. Content Standards</h2>
        <p>Do not promote content that violates YouTube&apos;s Terms of Service, including spam, scams, or harmful content.</p>
        <h2 className="text-lg font-semibold text-ink-900">4. Platform Integrity</h2>
        <p>Do not attempt to manipulate the platform, exploit bugs, or engage in fraudulent activity. Violations may result in account suspension.</p>
        <h2 className="text-lg font-semibold text-ink-900">5. Creator Safety</h2>
        <p>Understand the difference between authentic creator discovery and artificial engagement. Sub2Sub promotes responsible growth, not bot schemes or spam.</p>
      </div>
    </div>
  );
}
