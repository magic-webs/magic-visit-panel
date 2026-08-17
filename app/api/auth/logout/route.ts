import { NextResponse } from "next/server";
import { checkPanelRequestHeader } from "@/lib/api-helpers";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const res = NextResponse.json({ ok: true as const });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
