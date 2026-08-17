"use client";

import * as React from "react";
import type { PanelOperator } from "@/lib/types";

const OperatorContext = React.createContext<PanelOperator | null>(null);

export function OperatorProvider({ operator, children }: { operator: PanelOperator; children: React.ReactNode }) {
  return <OperatorContext.Provider value={operator}>{children}</OperatorContext.Provider>;
}

/** The signed-in panel operator (super_admin | tenant_admin), hydrated server-side by app/(dashboard)/layout.tsx from the httpOnly session cookie. */
export function useOperator(): PanelOperator {
  const operator = React.useContext(OperatorContext);
  if (!operator) {
    throw new Error("useOperator must be used within the (dashboard) route group.");
  }
  return operator;
}
