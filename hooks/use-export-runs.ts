"use client";

import { useQuery } from "@tanstack/react-query";
import { getExportRuns } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";

export function useExportRuns(tenantId: string, tenantSlug: string) {
  return useQuery({
    queryKey: queryKeys.exportRuns.list(tenantId),
    queryFn: () => getExportRuns(tenantId, tenantSlug),
    // Polls so in-flight runs update live, without needing a GitHub Actions webhook.
    refetchInterval: 15_000,
  });
}
