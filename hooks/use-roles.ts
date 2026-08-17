"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRole, deleteRole, listRoles, updateRole } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";
import type { CreateRoleInput, UpdateRoleInput } from "@/lib/types";

export function useRoles(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.roles.list(tenantId),
    queryFn: () => listRoles(tenantId),
    select: (data) => data.roles,
  });
}

export function useRole(tenantId: string, roleId: string) {
  const query = useRoles(tenantId);
  return { ...query, role: query.data?.find((role) => role.id === roleId) };
}

export function useCreateRole(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(tenantId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.list(tenantId) }),
  });
}

export function useUpdateRole(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, input }: { roleId: string; input: UpdateRoleInput }) => updateRole(tenantId, roleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.list(tenantId) }),
  });
}

export function useDeleteRole(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(tenantId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.list(tenantId) }),
  });
}
