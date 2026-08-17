"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/instant";
import { getTenantConfig, putTenantConfig } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";
import type { BrandingRow, TenantConfigInput, ThemeRow } from "@/lib/types";

export function useTenantConfig(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.tenantConfig.detail(tenantId),
    queryFn: () => getTenantConfig(tenantId),
  });
}

export function useSaveTenantConfig(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantConfigInput) => putTenantConfig(tenantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantConfig.detail(tenantId) });
    },
  });
}

// Realtime read used by tenants/[tenantId]/layout.tsx to re-skin the whole
// tenant-scoped subtree the instant a save lands — a direct InstantDB read
// (granted by instant.perms.ts to both operator tiers) rather than the REST
// route, so every open tab/window picks up a saved theme change live.
export function useTenantThemeLive(tenantId: string | undefined) {
  const { data, isLoading } = db.useQuery(
    tenantId ? { themes: { $: { where: { tenantId } } }, branding: { $: { where: { tenantId } } } } : null,
  );
  return {
    theme: data?.themes?.[0] as unknown as ThemeRow | undefined,
    branding: data?.branding?.[0] as unknown as BrandingRow | undefined,
    isLoading,
  };
}
