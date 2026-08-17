"use client";

import { useMutation } from "@tanstack/react-query";
import { triggerBuild, type TriggerBuildInput } from "@/lib/auth-bridge-client";

export function useTriggerBuild(tenantId: string) {
  return useMutation({
    mutationFn: (input: TriggerBuildInput) => triggerBuild(tenantId, input),
  });
}
