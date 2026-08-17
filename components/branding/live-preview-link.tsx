"use client";

import * as React from "react";
import { ExternalLink, Globe, MonitorSmartphone, CloudUpload, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTriggerWebDeploy } from "@/hooks/use-trigger-web-deploy";

// Local Expo web dev server default (`bunx expo start --web`, SDK 50+ unifies
// on Metro's own port). Overridable per-machine via NEXT_PUBLIC_MOBILE_WEB_URL
// since a teammate's dev server may be on a different port/host.
const LOCAL_WEB_URL = process.env.NEXT_PUBLIC_MOBILE_WEB_URL || "http://localhost:8081";

/**
 * Resolves and shows the URL this tenant's web/PWA build is actually
 * reachable at right now: the custom domain once one's configured and
 * deployed, or the local Expo web dev server in the meantime — so there's
 * always something to click through to while testing, not just a bare
 * text field. Also triggers a fresh Cloudflare Pages deploy of that same
 * web build (see .github/workflows/web-deploy.yml in magic-visit-app) —
 * requires GITHUB_TOKEN configured on the panel, same as the APK build
 * trigger; falls back to just the preview link if it isn't.
 */
export function LivePreviewLink({ tenantId, tenantSlug, customDomain }: { tenantId: string; tenantSlug: string; customDomain: string }) {
  const trimmed = customDomain.trim();
  const hasDomain = trimmed.length > 0;
  const url = hasDomain ? `https://${trimmed}` : LOCAL_WEB_URL;

  const deploy = useTriggerWebDeploy(tenantId);
  const notConfigured = deploy.isError && /GITHUB_TOKEN|501/i.test(deploy.error.message);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {hasDomain ? <Globe className="size-4" /> : <MonitorSmartphone className="size-4" />}
          Live preview
        </CardTitle>
        <CardDescription>
          {hasDomain
            ? "This tenant's custom domain, once DNS is pointed at the deployed web build."
            : "No custom domain set yet — this opens the local Expo web dev server instead."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Always stacked, not a row that squeezes URL + badge + button
            side by side — this card sits in a 2-up grid inside a column
            capped at max-w-md, so it can end up well under 250px wide even
            on a huge monitor; a viewport-based sm:flex-row here would
            never kick in for that case and the row would just overflow. */}
        <div className="flex min-w-0 items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-sm">{url}</code>
          {!hasDomain && (
            <Badge variant="secondary" className="shrink-0">
              local only
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="self-start" render={<a href={url} target="_blank" rel="noreferrer" />}>
          Open <ExternalLink className="size-3.5" />
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => deploy.mutate({ tenantSlug })}
          disabled={deploy.isPending}
        >
          {deploy.isPending ? <Spinner className="size-4" /> : <CloudUpload className="size-4" />}
          {deploy.isPending ? "Deploying…" : "Deploy web build"}
        </Button>

        {deploy.isSuccess && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              Deploy started.{" "}
              <a href={deploy.data.actionsUrl} target="_blank" rel="noreferrer" className="underline">
                Watch its progress
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
      </CardFooter>
    </Card>
  );
}
