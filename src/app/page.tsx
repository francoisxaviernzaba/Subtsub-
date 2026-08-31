import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/home");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold">
          <div className="size-8 rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 grid place-items-center text-white text-sm shadow-glow">S2S</div>
          SUB2SUB
        </div>
        <Link href="/login" className="btn btn-primary">Get started</Link>
      </header>
      <main className="flex-1 grid place-items-center px-5">
        <div className="max-w-3xl text-center">
          <div className="inline-flex chip mb-4">For YouTube creators</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Watch. Subscribe. <span className="bg-gradient-to-r from-brand-500 to-pink-500 bg-clip-text text-transparent">Earn.</span>
          </h1>
          <p className="mt-4 text-ink-500 text-lg max-w-xl mx-auto">
            Earn coins by discovering boosted videos and channels. Spend them to boost your own — real YouTube API verification, real rules.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="btn btn-primary h-12 px-6 text-base">Sign in with Google</Link>
            <a href="#how" className="btn btn-outline h-12 px-6 text-base">How it works</a>
          </div>
        </div>
        <section id="how" className="mt-24 grid sm:grid-cols-3 gap-4 max-w-5xl w-full">
          {[
            { t: "Connect YouTube", d: "Verify your channel once. It's permanently linked to your account." },
            { t: "Earn Coins", d: "Watch boosted videos and subscribe to channels to earn verified rewards." },
            { t: "Boost your content", d: "Spend coins to put your videos and channel in front of real users." },
          ].map((c) => (
            <div key={c.t} className="card p-5">
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-ink-500 mt-1">{c.d}</div>
            </div>
          ))}
        </section>
      </main>
      <footer className="px-5 py-6 text-center text-xs text-ink-500">© SUB2SUB — built with Next.js, Prisma & YouTube Data API v3</footer>
    </div>
  );
}
