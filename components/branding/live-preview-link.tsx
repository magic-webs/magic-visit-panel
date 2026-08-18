"use client";

import * as React from "react";
import { ExternalLink, Globe, MonitorSmartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Local Expo web dev server default (`bunx expo start --web`, SDK 50+ unifies
// on Metro's own port). Overridable per-machine via NEXT_PUBLIC_MOBILE_WEB_URL
// since a teammate's dev server may be on a different port/host.
const LOCAL_WEB_URL = process.env.NEXT_PUBLIC_MOBILE_WEB_URL || "http://localhost:8081";

/**
 * Resolves and shows the URL this tenant's web/PWA build is actually
 * reachable at right now: the custom domain once one's configured and
 * deployed, or the local Expo web dev server in the meantime — so there's
 * always something to click through to while testing, not just a bare
 * text field. Triggering an actual deploy lives on the Export page now
 * (see components/export/deploy-web-button.tsx) — this is preview-only.
 */
export function LivePreviewLink({ customDomain }: { tenantId?: string; tenantSlug?: string; customDomain: string }) {
  const trimmed = customDomain.trim();
  const hasDomain = trimmed.length > 0;
  const url = hasDomain ? `https://${trimmed}` : LOCAL_WEB_URL;

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
    </Card>
  );
}
