import { NextResponse } from "next/server";
import { checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ tenantId: string }> };

const GITHUB_OWNER = process.env.MOBILE_REPO_OWNER || "magic-webs";
const GITHUB_REPO = process.env.MOBILE_REPO_NAME || "magic-visit-app";
const GITHUB_REF = process.env.MOBILE_REPO_REF || "main";
const WORKFLOW_FILE = "eas-build.yml";

// Dispatches magic-visit-app's eas-build.yml via the GitHub API directly (not the bridge) since
// this triggers CI in another repo. Needs a server-only GITHUB_TOKEN (actions: write); 501s if
// unset so the UI can fall back to the manual EAS-dashboard link instead of failing silently.
export async function POST(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;
  void tenantId; // the dispatch uses tenantSlug from the request body instead

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Automated builds aren't configured yet — set GITHUB_TOKEN on the panel to enable this." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const tenantSlug = typeof body?.tenantSlug === "string" ? body.tenantSlug : undefined;
  const platform = typeof body?.platform === "string" ? body.platform : "android";
  const profile = typeof body?.profile === "string" ? body.profile : "preview";
  if (!tenantSlug) {
    return NextResponse.json({ error: "Missing tenantSlug." }, { status: 400 });
  }

  const dispatchUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  const res = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: GITHUB_REF, inputs: { tenant_slug: tenantSlug, platform, profile } }),
  });

  // workflow_dispatch returns 204 with no run id, so we can only point at the workflow's Actions page.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `GitHub couldn't start the build (${res.status}). ${detail || ""}`.trim() },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true as const,
    actionsUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
  });
}
