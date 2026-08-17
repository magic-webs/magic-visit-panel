// React Query key factory — keeps invalidation call sites consistent instead
// of hand-rolling arrays everywhere.
export const queryKeys = {
  tenants: {
    all: ["tenants"] as const,
    list: () => [...queryKeys.tenants.all, "list"] as const,
    detail: (tenantId: string) => [...queryKeys.tenants.all, "detail", tenantId] as const,
  },
  roles: {
    all: (tenantId: string) => ["roles", tenantId] as const,
    list: (tenantId: string) => [...queryKeys.roles.all(tenantId), "list"] as const,
  },
  tenantConfig: {
    detail: (tenantId: string) => ["tenant-config", tenantId] as const,
  },
};
