// Deliberately dependency-free (no next/headers) — proxy.ts needs this
// constant too, and the proxy runs in the Edge runtime where next/headers'
// dynamic cookies()/headers() APIs aren't available the way they are in
// Server Components / Route Handlers.
export const SESSION_COOKIE_NAME = "panel_session";
