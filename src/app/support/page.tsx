import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupportClient } from "@/components/support-client";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const u = await auth();
  if (!u?.user?.id) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Support</h1>
        <p className="text-sm text-ink-500">Need help? Send us a message and we&apos;ll get back to you.</p>
      </div>
      <SupportClient />
    </div>
  );
}
