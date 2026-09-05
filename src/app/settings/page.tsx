import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsClient } from "@/components/settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: { yt?: string; msg?: string } }) {
  const u = await auth();
  if (!u?.user?.id) return null;
  const yt = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
  const dbUser = await prisma.user.findUnique({ where: { id: u.user.id } });
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-500">Manage your account, security, and connected services.</p>
      </div>
      <SettingsClient
        user={{ name: u.user.name || "", email: u.user.email || "", username: dbUser?.username || "" }}
        youtube={yt ? { id: yt.youtubeId, title: yt.title, handle: yt.handle, thumbnailUrl: yt.thumbnailUrl, verified: yt.verified, connectedAt: yt.connectedAt.toISOString() } : null}
        ytStatus={searchParams.yt}
        ytMessage={searchParams.msg}
      />
    </div>
  );
}
