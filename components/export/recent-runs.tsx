"use client";

import * as React from "react";
import { ExternalLink, Loader2, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useExportRuns } from "@/hooks/use-export-runs";
import type { RunSummary } from "@/lib/auth-bridge-client";

function StatusBadge({ status, conclusion }: Pick<RunSummary, "status" | "conclusion">) {
  if (status !== "completed") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="size-3 animate-spin" /> {status === "queued" ? "Queued" : "Running"}
      </Badge>
    );
  }
  if (conclusion === "success") {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white">
        <CheckCircle2 className="size-3" /> Success
      </Badge>
    );
  }
  if (conclusion === "failure") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <CircleDashed className="size-3" /> {conclusion ?? "Unknown"}
    </Badge>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Build/deploy history for both eas-build.yml and web-deploy.yml — not
// filtered to this one tenant (see the API route's own comment for why
// that isn't reliably possible), but still a genuinely useful "what's
// happened on CI recently" view, polling every 15s so in-flight runs
// update without a manual refresh.
export function RecentRuns({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useExportRuns(tenantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>
          The last builds and deploys across all tenants — GitHub doesn&apos;t expose which tenant a run was for, so
          this isn&apos;t filtered to just this one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data?.configured ? (
          <p className="text-sm text-muted-foreground">
            Set <code>GITHUB_TOKEN</code> on the panel to see build/deploy history here.
          </p>
        ) : data.runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No runs yet — trigger a build or deploy above to see it here.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.workflow}</TableCell>
                    <TableCell>
                      <StatusBadge status={run.status} conclusion={run.conclusion} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{relativeTime(run.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <a
                        href={run.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary underline"
                      >
                        View <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
