import { NextResponse } from "next/server";
import { checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ tenantId: string }> };

const GITHUB_OWNER = process.env.MOBILE_REPO_OWNER || "magic-webs";
const GITHUB_REPO = process.env.MOBILE_REPO_NAME || "uj-ramnagar-mobile";
const GITHUB_REF = process.env.MOBILE_REPO_REF || "main";
const WORKFLOW_FILE = "eas-build.yml";

// Dispatches magic-visit-app's .github/workflows/eas-build.yml — a real
// GitHub API call, not a bridge route, since this has nothing to do with
// tenant data and everything to do with triggering CI in a different repo.
// Requires a GITHUB_TOKEN (a PAT/fine-grained token with `actions: write` on
// that repo) as a server-only secret; without one configured this responds
// 501 so the UI can fall back to the manual EAS-dashboard link instead of
// silently failing.
export async function POST(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;
  void tenantId; // not needed for the dispatch itself — tenantSlug (from the request body) is what the workflow actually uses

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

  // workflow_dispatch returns 204 with an empty body on success — there is
  // no run id in this response, so the best we can point at is the
  // workflow's own Actions page (its most recent run will be this one).
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
