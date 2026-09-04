import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Sub2Sub",
  description: "Contact Sub2Sub support for help with creator growth, campaigns, and account issues.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-sm text-ink-500 mt-1">Get help with Sub2Sub creator growth, campaigns, and account issues.</p>
      </div>
      <div className="card p-6 space-y-4 text-sm text-ink-500">
        <p>For support, email us at <a href="mailto:support@sub2sub.com" className="text-brand-600 hover:underline">support@sub2sub.com</a>.</p>
        <p>For partnership inquiries, reach out at <a href="mailto:partnerships@sub2sub.com" className="text-brand-600 hover:underline">partnerships@sub2sub.com</a>.</p>
        <p>For general questions, use the in-app <Link href="/support" className="text-brand-600 hover:underline">Support</Link> page.</p>
      </div>
    </div>
  );
}
