import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { getSettings } from "./settings";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
    } & DefaultSession["user"];
  }
}

const adminEmails = (process.env.ADMIN_EMAILS || "")
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
      // require verified email at provider level
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only allow Google; account.provider check enforced by config
      if (account?.provider !== "google") return false;
      if (!user.email) return false;
      // Check user status on subsequent sign-ins
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (existing && (existing.status === "BANNED" || existing.status === "SUSPENDED")) {
        return false;
      }
      return true;
    },
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
      // bootstrap admin role from env list
      const isAdmin = adminEmails.includes(user.email.toLowerCase());
      if (isAdmin) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
      // last seen
      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    },
    async signIn({ user }) {
      if (!user.id) return;
      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
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
