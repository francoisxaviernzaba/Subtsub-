import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: { from?: string; error?: string } }) {
  const session = await auth();
  if (session?.user) redirect(searchParams.from || "/s2s");

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-500 grid place-items-center text-white font-extrabold shadow-glow">S2S</div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to SUB2SUB</h1>
        <p className="mt-2 text-ink-500 text-sm">Sign in with Google to continue.</p>

        {searchParams.error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
            {searchParams.error === "AccessDenied" ? "Access denied. Your account may be suspended." : "Sign in failed. Please try again."}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: searchParams.from || "/s2s" });
          }}
        >
          <button type="submit" className="btn btn-primary w-full h-12 text-base mt-6">
            <GoogleG className="mr-1" /> Continue with Google
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-ink-500">
          By signing in, you agree to our <a href="/terms" className="text-brand-500 hover:underline">Terms</a> and <a href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.32A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.98 10.7A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.3-1.7V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.02l3.02-2.32z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.98l3.02 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
