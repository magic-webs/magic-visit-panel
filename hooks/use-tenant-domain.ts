"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTenantDomain, listTenantDomains, removeTenantDomain } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";

export function useTenantDomains(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.tenantDomains.list(tenantId),
    queryFn: () => listTenantDomains(tenantId),
    // Polls while DNS/SSL validation is still in flight so status updates without a manual refresh.
    refetchInterval: (query) => (query.state.data?.domains.some((d) => d.status !== "active") ? 10_000 : false),
  });
}

export function useAddTenantDomain(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => addTenantDomain(tenantId, domain),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenantDomains.list(tenantId) }),
  });
}

export function useRemoveTenantDomain(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => removeTenantDomain(tenantId, domain),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenantDomains.list(tenantId) }),
  });
}
