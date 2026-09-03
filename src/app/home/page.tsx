import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DiscoverGrid } from "@/components/discover-grid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await auth();
  if (!user?.user?.id) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Discover</h1>
          <p className="text-sm text-ink-500">Watch & subscribe to earn coins. Verified by YouTube.</p>
        </div>
      </div>
      <DiscoverGrid />
    </div>
  );
}
