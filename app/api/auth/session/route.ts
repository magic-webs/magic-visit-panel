import { NextResponse } from "next/server";
import { checkPanelRequestHeader } from "@/lib/api-helpers";
import { SESSION_COOKIE_NAME, serializeSession } from "@/lib/session";
import type { PanelOperator } from "@/lib/types";

// Stores the client's exchanged InstantDB refresh_token as an httpOnly cookie; browser JS never
// sees it again — privileged mutations go through Route Handlers that read it back server-side.
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
