import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · SUB2SUB",
  description: "Privacy policy for SUB2SUB platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-ink-500">Last updated: September 3, 2026</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>SUB2SUB respects your privacy and is committed to protecting your personal data.</p>
        <h2 className="text-lg font-semibold text-ink-900">1. Information We Collect</h2>
        <p>We collect: (a) Account information (email, name, profile picture); (b) YouTube channel information (channel ID, handle, subscriber count); (c) Usage data (tasks completed, coins earned); (d) Payment information (processed securely by Gumroad).</p>
        <h2 className="text-lg font-semibold text-ink-900">2. How We Use Your Information</h2>
        <p>We use your information to: provide and improve our services; process transactions; send notifications; prevent fraud and abuse; analyze platform usage.</p>
        <h2 className="text-lg font-semibold text-ink-900">3. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with: service providers (Gumroad for payments); legal authorities when required by law.</p>
        <h2 className="text-lg font-semibold text-ink-900">4. YouTube Data</h2>
        <p>We access your YouTube data only with your explicit consent via OAuth. We store encrypted tokens and never access your YouTube password.</p>
        <h2 className="text-lg font-semibold text-ink-900">5. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising.</p>
        <h2 className="text-lg font-semibold text-ink-900">6. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        <h2 className="text-lg font-semibold text-ink-900">7. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data by contacting us. You can also delete your account at any time.</p>
        <h2 className="text-lg font-semibold text-ink-900">8. Contact</h2>
        <p>For privacy concerns, contact us at privacy@subtsub.vercel.app.</p>
      </div>
    </div>
  );
}
