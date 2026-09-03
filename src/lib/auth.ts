import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { getSettings } from "./settings";
import { applySecrets } from "./secrets";
import { creditCoins } from "./coins";
import { addXp, updateDailyStreak } from "./gamification";

// Apply SECRETS_BLOB to process.env on every cold start
applySecrets();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
    } & DefaultSession["user"];
  }
}

export const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const u = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
        session.user.role = u?.role ?? "USER";
        session.user.status = u?.status ?? "ACTIVE";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const isAdmin = adminEmails.includes(user.email.toLowerCase());
      if (isAdmin) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
      const settings = await getSettings();
      if (settings.welcomeCoins > 0) {
        await creditCoins({
          userId: user.id!,
          amount: settings.welcomeCoins,
          type: "ADMIN_ADJUSTMENT",
          note: `Welcome bonus for new signup`,
          idempotencyKey: `welcome.${user.id}`,
        });
        await prisma.notification.create({
          data: {
            userId: user.id!,
            kind: "COIN_PURCHASE",
            title: `+${settings.welcomeCoins} welcome coins`,
            body: `Welcome to SUB2SUB! You received ${settings.welcomeCoins} coins for signing up.`,
            link: "/transactions",
          },
        }).catch(() => {});
      }
      await addXp(user.id!, 50, "signup");
      await updateDailyStreak(user.id!);
    },
    async signIn({ user }) {
      if (!user.id) return;
      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
      await addXp(user.id, 5, "login").catch(() => {});
      await updateDailyStreak(user.id).catch(() => {});
    },
  },
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (!u || u.role !== "ADMIN") return null;
  return u;
}
