import { NextResponse } from "next/server";
import { bridgeFetch, BridgeError } from "@/lib/bridge-server";
import { checkPanelRequestHeader } from "@/lib/api-helpers";
import type { PanelOperator } from "@/lib/types";

// Proxies to the auth-bridge's POST /panel/login server-to-server. Returns
// the one-time InstantDB sign-in token to the browser — it's single-use and
// expires quickly, so handing it back to the client here is safe; the
// client immediately exchanges it (db.auth.signInWithToken) and the
// resulting refresh_token is what actually becomes the durable session (see
// /api/auth/session).
export async function POST(request: Request) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : undefined;
  const password = typeof body?.password === "string" ? body.password : undefined;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const data = await bridgeFetch<{ token: string; operator: PanelOperator }>("/panel/login", {
      method: "POST",
      body: { email, password },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BridgeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
