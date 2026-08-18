"use client";

import { useQuery } from "@tanstack/react-query";
import { getExportRuns } from "@/lib/auth-bridge-client";
import { queryKeys } from "@/lib/query-keys";

export function useExportRuns(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.exportRuns.list(tenantId),
    queryFn: () => getExportRuns(tenantId),
    // Polls while any run might still be in flight — cheap, and gives the
    // "tracking" table a live feel without needing a webhook/callback from
    // GitHub Actions back into the panel.
    refetchInterval: 15_000,
  });
}
