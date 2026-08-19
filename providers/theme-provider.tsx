"use client";

// The operator's own light/dark chrome preference — orthogonal to a tenant's
// brand theme, which layers on top of whichever mode this provider picks.
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
