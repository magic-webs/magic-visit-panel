"use client";

import * as React from "react";
import { ExternalLink, Globe, CloudCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Resolves and shows the URL this tenant's web/PWA build is actually
 * reachable at: the custom domain once one's configured (DNS pointed at the
 * deployed build), or otherwise the tenant's Cloudflare Pages project URL —
 * `web-deploy.yml` deploys every tenant to its own project named after its
 * slug (see app/api/tenants/[tenantId]/deploy-web/route.ts's
 * `cloudflareProject` default), so that URL is a deterministic
 * `https://<slug>.pages.dev` with nothing to look up. This is the same link
 * shown after triggering a deploy from the Export page (see
 * components/export/deploy-web-button.tsx) — it just stays visible here
 * too, since it doesn't depend on that mutation's transient success state.
 */
export function LivePreviewLink({ tenantSlug, customDomain }: { tenantId?: string; tenantSlug: string; customDomain: string }) {
  const trimmed = customDomain.trim();
  const hasDomain = trimmed.length > 0;
  const url = hasDomain ? `https://${trimmed}` : `https://${tenantSlug}.pages.dev`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {hasDomain ? <Globe className="size-4" /> : <CloudCog className="size-4" />}
          Live web / PWA
        </CardTitle>
        <CardDescription>
          {hasDomain
            ? "This tenant's custom domain, once DNS is pointed at the deployed web build."
            : "No custom domain set — this is the tenant's Cloudflare Pages project. Live once a web deploy has run (see the Export page)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-sm">{url}</code>
          {!hasDomain && (
            <Badge variant="secondary" className="shrink-0">
              pages.dev
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="self-start" render={<a href={url} target="_blank" rel="noreferrer" />}>
          Open <ExternalLink className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
