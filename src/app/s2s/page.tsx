import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DiscoverGrid } from "@/components/discover-grid";

export const dynamic = "force-dynamic";

export default async function S2SPage() {
  const user = await auth();
  if (!user?.user?.id) return null;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">S2S — Subscribe & Watch to Earn</h1>
        <p className="text-sm text-ink-500">Watch boosted videos in-app (30s minimum) or subscribe to channels. Verified by YouTube.</p>
      </div>
      <DiscoverGrid />
    </div>
  );
}
