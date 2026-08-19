"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeScope } from "@/components/theme/theme-scope";
import { useTenant } from "@/hooks/use-tenants";
import { useTenantThemeLive } from "@/hooks/use-tenant-config";
import { useHydrated } from "@/hooks/use-hydrated";
import type { TenantStatus } from "@/lib/types";

const STATUS_VARIANT: Record<TenantStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trial: "secondary",
  suspended: "destructive",
  cancelled: "outline",
};

export default function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const { organization } = useTenant(tenantId);
  const { theme: liveTheme, branding } = useTenantThemeLive(tenantId);
  const { resolvedTheme } = useTheme();
  const mounted = useHydrated();

  const mode: "light" | "dark" = mounted && resolvedTheme === "dark" ? "dark" : "light";

  const header = (
    <div className="flex flex-col gap-3 border-b bg-card/50 px-6 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tenants">Tenants</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{organization?.name ?? <Skeleton className="h-4 w-32" />}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{branding?.appName || organization?.name || "Loading…"}</h1>
        {organization && (
          <Badge variant={STATUS_VARIANT[organization.status]} className="capitalize">
            {organization.status}
          </Badge>
        )}
      </div>
    </div>
  );

  // No saved theme yet — keep the panel's neutral default chrome so it's obvious appearance isn't configured.
  if (!liveTheme) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        {header}
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <ThemeScope
      light={liveTheme.light}
      dark={liveTheme.dark}
      radius={liveTheme.radius}
      font={liveTheme.font}
      mode={mode}
      className="flex min-h-full flex-1 flex-col bg-background text-foreground"
    >
      {header}
      <div className="flex flex-1 flex-col">{children}</div>
    </ThemeScope>
  );
}
