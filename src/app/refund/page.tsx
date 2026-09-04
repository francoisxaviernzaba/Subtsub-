import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Sub2Sub",
  description: "Refund policy for Sub2Sub coin purchases and services.",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Refund Policy</h1>
      <p className="text-sm text-ink-500">Last updated: September 4, 2026</p>
      <div className="card p-6 space-y-4 text-sm text-ink-500 leading-relaxed">
        <p>Due to the digital nature of coins and instant delivery, we generally do not offer refunds. However, if you experience issues with your purchase, contact our support team.</p>
        <h2 className="text-lg font-semibold text-ink-900">1. Coin Purchases</h2>
        <p>All coin purchases are final. Coins are virtual credits used within the Sub2Sub platform and have no real-world value.</p>
        <h2 className="text-lg font-semibold text-ink-900">2. Payment Processing</h2>
        <p>Payments are processed through Buy Me a Coffee. Refund requests may be subject to their terms and conditions.</p>
        <h2 className="text-lg font-semibold text-ink-900">3. Contact Support</h2>
        <p>If you believe a charge was made in error, contact us at <a href="mailto:support@sub2sub.com" className="text-brand-600 hover:underline">support@sub2sub.com</a> within 48 hours of the transaction.</p>
      </div>
    </div>
  );
}
