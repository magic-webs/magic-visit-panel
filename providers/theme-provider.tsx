"use client";

// The OPERATOR's own light/dark chrome preference — orthogonal to a
// tenant's brand theme (see app/(dashboard)/tenants/[tenantId]/layout.tsx,
// which layers a tenant's derived OKLCH tokens on top of whichever of
// light/dark this provider has picked).
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
