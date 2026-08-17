// Small shared helpers for app/api/** Route Handlers — every protected route
// repeats the same three steps: check the CSRF header, resolve the session,
// translate a BridgeError into a JSON response with the right status.
import { NextResponse } from "next/server";
import { getSession, type PanelSession } from "@/lib/session";
import { BridgeError } from "@/lib/bridge-server";

// Custom-header CSRF check — a simple cross-site form POST can't set this
// header, so this blocks naive CSRF against the cookie-authenticated routes.
export function checkPanelRequestHeader(request: Request): NextResponse | null {
  if (request.headers.get("x-panel-request") !== "1") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return null;
}

export async function requireSessionOrRespond(): Promise<
  { session: PanelSession; response: null } | { session: null; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  return { session, response: null };
}

export function bridgeErrorResponse(err: unknown): NextResponse {
  if (err instanceof BridgeError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
