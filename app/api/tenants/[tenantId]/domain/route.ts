import { NextResponse } from "next/server";
import { bridgeFetch } from "@/lib/bridge-server";
import { bridgeErrorResponse, checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";
import {
  addPagesDomain,
  cloudflareConfigured,
  CloudflareError,
  listPagesDomains,
  removePagesDomain,
} from "@/lib/cloudflare-pages";
import type { Organization } from "@/lib/types";

type RouteContext = { params: Promise<{ tenantId: string }> };

// Reuses the existing tenant-detail bridge call purely as an authorization
// gate (requireTenantAccess there 403s an out-of-scope tenant_admin) — its
// response also gives us the slug, which is this tenant's Cloudflare Pages
// project name (see deploy-web/route.ts's cloudflareProject default).
async function resolveProjectSlug(tenantId: string, token: string): Promise<string> {
  const org = await bridgeFetch<Organization>(`/platform/organizations/${tenantId}`, { token });
  return org.slug;
}

function cloudflareErrorResponse(err: CloudflareError) {
  return NextResponse.json({ error: err.message }, { status: err.status });
}

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

export async function GET(_request: Request, { params }: RouteContext) {
  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  if (!cloudflareConfigured()) {
    return NextResponse.json({ configured: false, domains: [] });
  }

  try {
    const slug = await resolveProjectSlug(tenantId, session.token);
    const domains = await listPagesDomains(slug);
    return NextResponse.json({ configured: true, domains });
  } catch (err) {
    if (err instanceof CloudflareError) return cloudflareErrorResponse(err);
    return bridgeErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  const body = await request.json().catch(() => null);
  const domain = typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : "";
  if (!DOMAIN_RE.test(domain)) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. app.example.com." }, { status: 400 });
  }

  try {
    const slug = await resolveProjectSlug(tenantId, session.token);
    const result = await addPagesDomain(slug, domain);
    return NextResponse.json({ domain: result });
  } catch (err) {
    if (err instanceof CloudflareError) return cloudflareErrorResponse(err);
    return bridgeErrorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  const domain = new URL(request.url).searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "Missing domain." }, { status: 400 });
  }

  try {
    const slug = await resolveProjectSlug(tenantId, session.token);
    await removePagesDomain(slug, domain);
    return NextResponse.json({ ok: true as const });
  } catch (err) {
    if (err instanceof CloudflareError) return cloudflareErrorResponse(err);
    return bridgeErrorResponse(err);
  }
}
