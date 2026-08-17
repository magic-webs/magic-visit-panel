"use client";

import { useMutation, useQuery as useReactQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/instant";
import { createTenant, listTenants, updateTenant } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";
import { useOperator } from "@/providers/operator-provider";
import type { CreateOrganizationInput, Organization, TenantSummary, UpdateOrganizationInput } from "@/lib/types";

// GET /platform/organizations (proxied by /api/tenants) is super_admin-only
// server-side — see auth-bridge/src/routes/panel.routes.ts. A tenant_admin
// operator falls back to a direct, realtime InstantDB read instead: that
// namespace's instant.perms.ts rule (`isScopedOperator`) already grants them
// view access to just the tenants they're linked to, and staff/branch counts
// are computed here the same way the bridge computes them server-side.
export function useTenants() {
  const operator = useOperator();
  const isSuperAdmin = operator.role === "super_admin";

  const apiQuery = useReactQuery({
    queryKey: queryKeys.tenants.list(),
    queryFn: listTenants,
    enabled: isSuperAdmin,
  });

  const instantQuery = db.useQuery(
    isSuperAdmin
      ? null
      : {
          organizations: {},
          profiles: { $: { where: { active: true } } },
          branches: { $: { where: { active: true } } },
        },
  );

  if (isSuperAdmin) {
    return {
      tenants: apiQuery.data?.organizations ?? [],
      isLoading: apiQuery.isLoading,
      error: apiQuery.error as Error | null | undefined,
    };
  }

  const organizations = instantQuery.data?.organizations ?? [];
  const profiles = instantQuery.data?.profiles ?? [];
  const branches = instantQuery.data?.branches ?? [];

  const tenants: TenantSummary[] = organizations.map((org) => ({
    ...(org as unknown as Organization),
    staffCount: profiles.filter((p) => p.tenantId === org.id).length,
    branchCount: branches.filter((b) => b.tenantId === org.id).length,
  }));

  return {
    tenants,
    isLoading: instantQuery.isLoading,
    error: instantQuery.error ? new Error(instantQuery.error.message) : null,
  };
}

/** A single tenant's core record — read live off InstantDB, granted to both operator tiers by instant.perms.ts. */
export function useTenant(tenantId: string | undefined) {
  const { data, isLoading, error } = db.useQuery(tenantId ? { organizations: { $: { where: { id: tenantId } } } } : null);
  const organization = data?.organizations?.[0] as unknown as Organization | undefined;
  return { organization, isLoading, error };
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createTenant(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.list() });
    },
  });
}

export function useUpdateTenant(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateTenant(tenantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(tenantId) });
    },
  });
}
