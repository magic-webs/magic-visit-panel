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

// Applies the theme as inline CSS vars on this wrapper (not an iframe or
// document root) — globals.css maps Tailwind colors to these vars, so
// descendants repaint for free. Redeclares font-sans so it re-resolves here
// instead of inheriting the page's <html> font.
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
