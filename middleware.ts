import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

// Cheap presence-only cookie check for fast redirects. This is NOT the real
// auth boundary — the cookie's value is never verified here (middleware runs
// on the Edge runtime and can't call the auth-bridge synchronously on every
// request). Every privileged Route Handler re-validates the session itself
// via lib/session.ts + a bearer-token round trip to the bridge, and
// InstantDB's own permission rules are the real backstop for realtime reads.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/tenants", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
