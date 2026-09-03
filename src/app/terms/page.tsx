import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · SUB2SUB",
  description: "Terms of service for SUB2SUB platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-ink-500">Last updated: September 3, 2026</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Welcome to SUB2SUB. By using our platform, you agree to these terms of service.</p>
        <h2 className="text-lg font-semibold text-ink-900">1. Acceptance of Terms</h2>
        <p>By accessing or using SUB2SUB, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
        <h2 className="text-lg font-semibold text-ink-900">2. Eligibility</h2>
        <p>You must be at least 13 years old to use SUB2SUB. By using our platform, you represent and warrant that you meet this age requirement.</p>
        <h2 className="text-lg font-semibold text-ink-900">3. User Conduct</h2>
        <p>You agree not to: (a) use the platform for any illegal purpose; (b) attempt to gain unauthorized access to the platform; (c) engage in any activity that interferes with or disrupts the platform; (d) use bots or automated tools to earn coins.</p>
        <h2 className="text-lg font-semibold text-ink-900">4. Coins and Payments</h2>
        <p>Coins are virtual credits with no real-world value. All purchases are final and non-refundable. We reserve the right to modify coin packages and pricing at any time.</p>
        <h2 className="text-lg font-semibold text-ink-900">5. YouTube API Usage</h2>
        <p>SUB2SUB uses the YouTube Data API v3. We are not affiliated with YouTube or Google. Your use of YouTube&apos;s services is subject to YouTube&apos;s Terms of Service.</p>
        <h2 className="text-lg font-semibold text-ink-900">6. Limitation of Liability</h2>
        <p>SUB2SUB is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the platform.</p>
        <h2 className="text-lg font-semibold text-ink-900">7. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
      </div>
    </div>
  );
}
