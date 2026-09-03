import { auth } from "@/lib/auth";
import { S2SClient } from "@/components/s2s-client";

export const dynamic = "force-dynamic";

export default async function S2SPage() {
  const user = await auth();
  if (!user?.user?.id) return null;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Discover</h1>
        <p className="text-sm text-ink-500">Watch boosted videos in-app (30s minimum) or subscribe to channels. Verified by YouTube.</p>
      </div>
      <S2SClient />
    </div>
  );
}
