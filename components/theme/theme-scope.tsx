"use client";

import * as React from "react";
import { deriveFullTokenSet, tokenSetToCssVars } from "@/lib/theme/derive-theme";
import { cn } from "@/lib/utils";
import type { ThemeBaseTokens } from "@/lib/types";

export interface ThemeScopeProps extends Omit<React.ComponentProps<"div">, "style"> {
  light: ThemeBaseTokens;
  dark: ThemeBaseTokens;
  radius: number;
  font: string;
  /** Which of the two derived token sets to actually apply right now. */
  mode: "light" | "dark";
}

// Applies a tenant's (or draft) theme as inline CSS custom properties on its
// own wrapper — NOT an iframe, NOT document.documentElement. Because
// app/globals.css's `@theme inline` block already maps every Tailwind color
// utility to one of these CSS vars, every descendant shadcn component just
// repaints correctly for free. Re-declares `font-sans` on itself (not just
// the variable) so `font-family` re-resolves here instead of inheriting
// whatever the page's own <html> font resolved to.
export const ThemeScope = React.forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { light, dark, radius, font, mode, className, children, ...props },
  ref,
) {
  const tokens = React.useMemo(() => deriveFullTokenSet(mode === "dark" ? dark : light, mode), [light, dark, mode]);
  const cssVars = React.useMemo(() => tokenSetToCssVars(tokens, { radius, font }), [tokens, radius, font]);

  return (
    <div
      ref={ref}
      data-theme-scope={mode}
      className={cn("font-sans", mode === "dark" && "dark", className)}
      style={{ ...cssVars, colorScheme: mode } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
});
