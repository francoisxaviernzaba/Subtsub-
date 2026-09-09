import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MobileCallbackPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  const from = searchParams.from || "/s2s";

  redirect(`com.sub2sub.app://oauth-callback?from=${encodeURIComponent(from)}`);
}
