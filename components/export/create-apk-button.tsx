"use client";

import * as React from "react";
import { Rocket, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTriggerBuild } from "@/hooks/use-trigger-build";

// Manual EAS-dashboard link always works with no setup. The automated path
// (dispatches magic-visit-app's eas-build.yml) needs GITHUB_TOKEN on the
// panel — without it the mutation 501s and this falls back to the manual link.
const EXPO_ACCOUNT = process.env.NEXT_PUBLIC_EXPO_ACCOUNT ?? "";
const EXPO_PROJECT_SLUG = process.env.NEXT_PUBLIC_EXPO_PROJECT_SLUG || "urmil-jewellers-ramnagar";

export function CreateApkButton({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const expoConfigured = EXPO_ACCOUNT.length > 0;
  const buildsUrl = `https://expo.dev/accounts/${EXPO_ACCOUNT}/projects/${EXPO_PROJECT_SLUG}/builds`;

  const trigger = useTriggerBuild(tenantId);

  const notConfigured = trigger.isError && /GITHUB_TOKEN|501/i.test(trigger.error.message);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => trigger.mutate({ tenantSlug, platform: "android", profile: "preview" })}
          disabled={trigger.isPending}
        >
          {trigger.isPending ? <Spinner className="size-4" /> : <Rocket className="size-4" />}
          {trigger.isPending ? "Starting build…" : "Create APK"}
        </Button>

        {expoConfigured && (
          <Button variant="outline" size="sm" render={<a href={buildsUrl} target="_blank" rel="noreferrer" />}>
            View builds on EAS <ExternalLink className="size-3.5" />
          </Button>
        )}
      </div>

      {trigger.isSuccess && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertDescription>
            Build started on GitHub Actions.{" "}
            <a href={trigger.data.actionsUrl} target="_blank" rel="noreferrer" className="underline">
              Watch its progress
            </a>
            {expoConfigured && (
              <>
                {" "}
                — it&apos;ll also show up on the{" "}
                <a href={buildsUrl} target="_blank" rel="noreferrer" className="underline">
                  EAS builds page
                </a>{" "}
                once it starts uploading.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {trigger.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {notConfigured ? (
              <>
                Automated builds aren&apos;t set up yet (needs a <code>GITHUB_TOKEN</code> on the panel with access to
                magic-visit-app&apos;s Actions).{" "}
                {expoConfigured ? (
                  <>Use &quot;View builds on EAS&quot; above to start one manually instead.</>
                ) : (
                  <>Set <code>NEXT_PUBLIC_EXPO_ACCOUNT</code> to at least get a link to the EAS dashboard in the meantime.</>
                )}
              </>
            ) : (
              trigger.error.message
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
