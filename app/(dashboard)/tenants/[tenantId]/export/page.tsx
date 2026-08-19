"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateApkButton } from "@/components/export/create-apk-button";
import { DeployWebButton } from "@/components/export/deploy-web-button";
import { RecentRuns } from "@/components/export/recent-runs";
import { CustomDomainCard } from "@/components/export/custom-domain-card";
import { LivePreviewLink } from "@/components/branding/live-preview-link";
import { useTenant } from "@/hooks/use-tenants";
import { useTenantThemeLive } from "@/hooks/use-tenant-config";

export default function ExportPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const { organization, isLoading } = useTenant(tenantId);
  const { branding } = useTenantThemeLive(tenantId);

  if (isLoading || !organization) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Export</h1>
        <p className="text-sm text-muted-foreground">
          Build and deploy {organization.name}&apos;s app — an installable Android APK, and the web/PWA build.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Android build</CardTitle>
            <CardDescription>
              Starts a build on EAS using the &quot;preview&quot; profile (internal distribution — installable APK, no
              store submission).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateApkButton tenantId={tenantId} tenantSlug={organization.slug} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Web / PWA deploy</CardTitle>
            <CardDescription>
              Exports the static web build and deploys it to this tenant&apos;s own Cloudflare Pages project (
              <code>{organization.slug}</code>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeployWebButton tenantId={tenantId} tenantSlug={organization.slug} />
          </CardContent>
        </Card>
      </div>

      <LivePreviewLink tenantSlug={organization.slug} customDomain={branding?.customDomain ?? ""} />

      <CustomDomainCard tenantId={tenantId} tenantSlug={organization.slug} />

      <RecentRuns tenantId={tenantId} tenantSlug={organization.slug} />
    </div>
  );
}
