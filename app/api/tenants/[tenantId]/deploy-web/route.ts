import { NextResponse } from "next/server";
import { checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ tenantId: string }> };

const GITHUB_OWNER = process.env.MOBILE_REPO_OWNER || "magic-webs";
const GITHUB_REPO = process.env.MOBILE_REPO_NAME || "magic-visit-app";
const GITHUB_REF = process.env.MOBILE_REPO_REF || "main";
const WORKFLOW_FILE = "web-deploy.yml";

// Same GitHub-dispatch pattern and GITHUB_TOKEN as build/route.ts (the EAS APK trigger), just a different workflow file.
export async function POST(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;
  void tenantId;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Automated deploys aren't configured yet — set GITHUB_TOKEN on the panel to enable this." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const tenantSlug = typeof body?.tenantSlug === "string" ? body.tenantSlug : undefined;
  if (!tenantSlug) {
    return NextResponse.json({ error: "Missing tenantSlug." }, { status: 400 });
  }
  // Defaults to the tenant's own slug — each tenant needs its own Cloudflare Pages project, or deploys would overwrite each other.
  const cloudflareProject = typeof body?.cloudflareProject === "string" ? body.cloudflareProject : tenantSlug;

  const dispatchUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  const res = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: GITHUB_REF, inputs: { tenant_slug: tenantSlug, cloudflare_project: cloudflareProject } }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `GitHub couldn't start the deploy (${res.status}). ${detail || ""}`.trim() },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true as const,
    actionsUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
  });
}
