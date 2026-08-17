import { NextResponse } from "next/server";
import { checkPanelRequestHeader } from "@/lib/api-helpers";
import { SESSION_COOKIE_NAME, serializeSession } from "@/lib/session";
import type { PanelOperator } from "@/lib/types";

// Receives the InstantDB refresh_token the client obtained by exchanging the
// one-time login token (db.auth.signInWithToken → db.getAuth().refresh_token)
// and stores it as the canonical httpOnly session cookie. From this point on
// the browser never sees this token again — every privileged mutation goes
// through a Route Handler that reads it back out of the cookie server-side.
export async function POST(request: Request) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const body = await request.json().catch(() => null);
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : undefined;
  const operator = body?.operator as PanelOperator | undefined;

  if (!refreshToken || !operator?.id || !operator?.role) {
    return NextResponse.json({ error: "Missing session data." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true as const, operator });
  res.cookies.set(SESSION_COOKIE_NAME, serializeSession({ token: refreshToken, operator }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
