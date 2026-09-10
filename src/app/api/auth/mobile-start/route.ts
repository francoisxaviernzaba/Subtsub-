import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "/s2s";

  const session = await auth();
  if (session?.user?.id) {
    return NextResponse.redirect(new URL(from, request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("s2s_mobile_from", from, {
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 10,
    httpOnly: true,
  });

  const url = new URL("/login", request.url);
  url.searchParams.set("from", from);
  return NextResponse.redirect(url);
}
