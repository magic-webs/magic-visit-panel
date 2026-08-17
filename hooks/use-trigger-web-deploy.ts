"use client";

import { useMutation } from "@tanstack/react-query";
import { triggerWebDeploy, type TriggerWebDeployInput } from "@/lib/auth-bridge-client";

export function useTriggerWebDeploy(tenantId: string) {
  return useMutation({
    mutationFn: (input: TriggerWebDeployInput) => triggerWebDeploy(tenantId, input),
  });
}
