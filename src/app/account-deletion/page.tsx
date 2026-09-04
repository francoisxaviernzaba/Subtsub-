import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account Deletion — Sub2Sub",
  description: "Request account deletion and data removal from Sub2Sub.",
};

export default async function AccountDeletionPage() {
  const session = await auth();
  if (session?.user) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Delete Account</h1>
        <div className="card p-6 space-y-4 text-sm text-ink-500">
          <p>Account deletion is permanent and cannot be undone. All your data will be removed.</p>
          <form action="/api/account/delete" method="POST">
            <button type="submit" className="btn btn-danger">Permanently Delete My Account</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Deletion</h1>
      <div className="card p-6 space-y-4 text-sm text-ink-500">
        <p>To request account deletion, please sign in and use the button below. Alternatively, email <a href="mailto:support@sub2sub.com" className="text-brand-600 hover:underline">support@sub2sub.com</a> with your request.</p>
        <p>Deletion includes: profile data, YouTube channel connection, campaign history, coin transactions, and all personal information.</p>
      </div>
    </div>
  );
}
