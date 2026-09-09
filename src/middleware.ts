import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication. Everything else is public.
const PROTECTED_PATHS = ["/s2s", "/boost", "/coins", "/settings", "/profile", "/transactions", "/quests", "/invite", "/support", "/leaderboard", "/admin", "/u/"];
const PROTECTED_API_PREFIXES = ["/api/me", "/api/discover", "/api/tasks", "/api/campaigns", "/api/boost", "/api/notifications", "/api/payments/create", "/api/admin", "/api/gamification", "/api/invite", "/api/account", "/api/youtube/connect", "/api/youtube/lookup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const hasSession =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token");

  if (!hasSession) {
    if (isProtectedApi) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/).*)",
  ],
};
