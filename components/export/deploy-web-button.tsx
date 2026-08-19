"use client";

import * as React from "react";
import { CloudUpload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTriggerWebDeploy } from "@/hooks/use-trigger-web-deploy";

// Triggers web-deploy.yml (same GITHUB_TOKEN gate as CreateApkButton);
// cloudflareProject defaults to the tenant's own slug so tenants don't share one Pages project.
export function DeployWebButton({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const deploy = useTriggerWebDeploy(tenantId);
  const notConfigured = deploy.isError && /GITHUB_TOKEN|501/i.test(deploy.error.message);

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" onClick={() => deploy.mutate({ tenantSlug })} disabled={deploy.isPending}>
        {deploy.isPending ? <Spinner className="size-4" /> : <CloudUpload className="size-4" />}
        {deploy.isPending ? "Deploying…" : "Deploy web build"}
      </Button>

      {deploy.isSuccess && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertDescription>
            Deploy started to Cloudflare Pages project <code>{tenantSlug}</code>.{" "}
            <a href={deploy.data.actionsUrl} target="_blank" rel="noreferrer" className="underline">
              Watch its progress
            </a>{" "}
            — once it finishes, the site is live at{" "}
            <a href={`https://${tenantSlug}.pages.dev`} target="_blank" rel="noreferrer" className="underline">
              {tenantSlug}.pages.dev
            </a>
            .
          </AlertDescription>
        </Alert>
      )}
      {deploy.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {notConfigured
              ? "Automated deploys aren't set up yet (needs a GITHUB_TOKEN on the panel)."
              : deploy.error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
