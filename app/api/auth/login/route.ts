import { NextResponse } from "next/server";
import { bridgeFetch, BridgeError } from "@/lib/bridge-server";
import { checkPanelRequestHeader } from "@/lib/api-helpers";
import type { PanelOperator } from "@/lib/types";

// Proxies auth-bridge's POST /panel/login; the one-time token is safe to return since it's
// single-use and short-lived — the client's exchanged refresh_token is the real session (see /api/auth/session).
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
