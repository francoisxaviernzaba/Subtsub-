import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { adminEmails } from "@/lib/auth";

export default async function SignupPage({ searchParams }: { searchParams: { from?: string } }) {
  const session = await auth();
  if (session?.user) redirect(searchParams.from || "/home");

  async function signup(formData: FormData) {
    "use server";
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const name = (formData.get("name") as string)?.trim();
    if (!email || !password) return { error: "Email and password are required." };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists." };
    const passwordHash = await bcrypt.hash(password, 10);
    const role = adminEmails.includes(email) ? "ADMIN" : "USER";
    await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash,
        role,
      },
    });
    await redirect(`/login?from=${encodeURIComponent(searchParams.from || "/home")}`);
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="card p-8 max-w-md w-full">
        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 grid place-items-center text-white font-extrabold shadow-glow">S2S</div>
        <h1 className="mt-4 text-2xl font-bold text-center">Create account</h1>
        <p className="mt-2 text-ink-500 text-sm text-center">Sign up with email and password.</p>
        <form action={signup} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" type="text" className="input w-full" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" required className="input w-full" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input name="password" type="password" required minLength={6} className="input w-full" placeholder="Minimum 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary w-full h-12 text-base">Create account</button>
        </form>
        <p className="mt-4 text-sm text-center text-ink-500">
          Already have an account? <a href={`/login?from=${encodeURIComponent(searchParams.from || "/home")}`} className="text-brand-500 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
