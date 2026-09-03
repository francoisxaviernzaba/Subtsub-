import { auth } from "@/lib/auth";
import { InviteSection } from "@/components/invite-section";

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  const u = await auth();
  if (!u?.user?.id) return null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Invite & Earn</h1>
        <p className="text-sm text-ink-500">Share your invite link. You earn coins when friends sign up and connect YouTube.</p>
      </div>
      <InviteSection userId={u.user.id} />
    </div>
  );
}
