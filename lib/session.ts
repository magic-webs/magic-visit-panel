// Server-only. Never import this from a Client Component — it reads the
// httpOnly `panel_session` cookie via next/headers, which is only available
// in Server Components, Route Handlers, and middleware.
import { cookies } from "next/headers";
import type { PanelOperator } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export { SESSION_COOKIE_NAME };

export interface PanelSession {
  /** InstantDB refresh_token — forwarded as `Authorization: Bearer <token>` to the auth-bridge. */
  token: string;
  operator: PanelOperator;
}

function parseSession(raw: string | undefined): PanelSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PanelSession>;
    if (!parsed.token || !parsed.operator?.id) return null;
    return parsed as PanelSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<PanelSession | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireSession(): Promise<PanelSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}

export function serializeSession(session: PanelSession): string {
  return JSON.stringify(session);
}
