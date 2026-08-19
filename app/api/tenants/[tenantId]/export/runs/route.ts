import { NextResponse } from "next/server";
import { requireSessionOrRespond } from "@/lib/api-helpers";

const GITHUB_OWNER = process.env.MOBILE_REPO_OWNER || "magic-webs";
const GITHUB_REPO = process.env.MOBILE_REPO_NAME || "magic-visit-app";
const WORKFLOW_FILES = ["eas-build.yml", "web-deploy.yml"] as const;

export interface RunSummary {
  id: number;
  workflow: string;
  status: string; // "queued" | "in_progress" | "completed" | ...
  conclusion: string | null; // "success" | "failure" | "cancelled" | null while running
  htmlUrl: string;
  createdAt: string;
  displayTitle: string;
}

// The subset of GitHub's workflow run object this route actually reads.
interface GithubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  display_title?: string;
}

// GitHub's runs API doesn't expose dispatch input values, so the workflows set
// `run-name: "${{ inputs.tenant_slug }} — ..."` and we match `display_title` against `?tenantSlug=`.
export async function GET(request: Request) {
  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;

  const tenantSlug = new URL(request.url).searchParams.get("tenantSlug");

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ configured: false, runs: [] as RunSummary[] });
  }

  try {
    const results = await Promise.all(
      WORKFLOW_FILES.map((file) =>
        fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${file}/runs?per_page=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
          },
        ),
      ),
    );

    const runs: RunSummary[] = [];
    for (const res of results) {
      if (!res.ok) continue;
      const data = (await res.json()) as { workflow_runs?: GithubWorkflowRun[] };
      for (const run of data.workflow_runs ?? []) {
        const displayTitle = run.display_title ?? run.name;
        // Match the exact leading segment, not a loose substring, so one slug can't match inside another.
        if (tenantSlug && !displayTitle.startsWith(`${tenantSlug} —`)) continue;
        runs.push({
          id: run.id,
          workflow: run.name,
          status: run.status,
          conclusion: run.conclusion,
          htmlUrl: run.html_url,
          createdAt: run.created_at,
          displayTitle,
        });
      }
    }
    runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ configured: true, runs: runs.slice(0, 15) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ configured: true, runs: [] as RunSummary[], error: "Couldn't reach GitHub." });
  }
}
