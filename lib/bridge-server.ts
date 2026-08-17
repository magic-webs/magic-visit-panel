// Server-only. Talks to the auth-bridge Worker directly — only ever called
// from app/api/** Route Handlers, never from a Client Component (the browser
// never sees AUTH_BRIDGE_URL or the bearer token directly, per the panel's
// cookie-based BFF auth model).

const RAW_BASE_URL = process.env.AUTH_BRIDGE_URL ?? "http://localhost:8787";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export class BridgeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface BridgeRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
}

// The bridge normally returns `{ error: string }` (see auth-bridge/src/lib/
// validation.ts and every route's own `c.json({ error: "..." }, ...)` calls)
// — but this stays defensive against a raw @hono/zod-validator failure
// (`{ success: false, error: <ZodError> }`, where `error` is an object, not
// a string) slipping through from some path that isn't wrapped, rather than
// silently collapsing to a useless generic message.
function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "The auth-bridge request failed.";
  const err = (data as { error?: unknown }).error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "issues" in err && Array.isArray((err as { issues: unknown }).issues)) {
    const issues = (err as { issues: Array<{ path?: unknown[]; message?: string }> }).issues;
    const first = issues[0];
    if (first?.message) {
      const path = Array.isArray(first.path) ? first.path.join(".") : undefined;
      return path ? `${path}: ${first.message}` : first.message;
    }
  }
  return "The auth-bridge request failed.";
}

export async function bridgeFetch<T>(path: string, options: BridgeRequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — leave data as null, fall through to status check below.
  }

  if (!res.ok) {
    throw new BridgeError(extractErrorMessage(data), res.status);
  }

  return data as T;
}
