import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DiscoverGrid } from "@/components/discover-grid";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await auth();
  if (!user?.user?.id) return null;
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Discover</h1>
          <p className="text-sm text-ink-500">Watch & subscribe to earn coins. Verified by YouTube.</p>
        </div>
      </div>
      <DiscoverGrid
        defaultMinReward={settings.minRewardPerAction}
      />
    </div>
  );
}
