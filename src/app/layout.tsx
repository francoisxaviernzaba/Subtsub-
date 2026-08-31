import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/toast";

export const metadata: Metadata = {
  title: { default: "SUB2SUB — Earn coins, grow your channel", template: "%s · SUB2SUB" },
  description:
    "Watch boosted videos, subscribe to boosted channels, and earn coins. Spend coins to boost your own YouTube presence.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "SUB2SUB",
    description: "Watch. Subscribe. Earn. Boost.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "SUB2SUB", description: "Watch. Subscribe. Earn. Boost." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const balance = session?.user?.id
    ? await prisma.coinTransaction
        .aggregate({ where: { userId: session.user.id }, _sum: { deltaCoins: true } })
        .then((r) => r._sum.deltaCoins ?? 0)
    : 0;
  const ytChannel = session?.user?.id
    ? await prisma.youTubeChannel.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="mx-auto max-w-[1600px]">
            {session?.user && (
              <Header
                user={{
                  id: session.user.id,
                  name: session.user.name ?? null,
                  email: session.user.email ?? null,
                  image: session.user.image ?? null,
                  role: session.user.role,
                }}
                balance={balance}
                youtube={ytChannel ? { id: ytChannel.id, title: ytChannel.title, handle: ytChannel.handle, thumbnailUrl: ytChannel.thumbnailUrl } : null}
              />
            )}
            <main className="px-3 sm:px-5 pb-24 md:pb-8 pt-4">{children}</main>
            {session?.user && <BottomNav />}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
