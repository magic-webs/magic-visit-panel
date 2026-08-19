"use client";

import { ExternalLink, Globe, CloudCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Custom domain if set, else the tenant's deterministic Cloudflare Pages URL
// (`https://<slug>.pages.dev` — web-deploy.yml names the project after the slug).
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
        </div>
        <Button variant="outline" size="sm" className="ml-auto" render={<a href={url} target="_blank" rel="noreferrer" />}>
          Open <ExternalLink className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
