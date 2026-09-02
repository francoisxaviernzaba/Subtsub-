import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/api/youtube/callback", "/api/debug", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];
const PUBLIC_API = ["/api/auth", "/api/debug"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Check session via cookie (NextAuth sets next-auth.session-token / __Secure-...)
  const hasSession =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token");
  if (!hasSession) {
    if (pathname.startsWith("/api/")) {
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
