// Ported from magic-visit-app/lib/theme/derive-brand-vars.ts — mirrors the mobile app's exact gradient/gold derivation so mobile-preview.tsx
// matches a real device, not the differently-derived web token set in derive-theme.ts. Keep in sync by hand if the mobile app's version changes.
import { parseOklch, oklchToHex, type Oklch } from "./oklch";
import type { ThemeBaseTokens } from "@/lib/types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lighten(color: Oklch, amount: number): Oklch {
  return { ...color, l: clamp01(color.l + amount) };
}

// Gold-ish scale derived from `secondary` (same hue, varying L/C) — same formula as the mobile app.
function deriveGoldScale(secondary: Oklch) {
  const near = (l: number, c: number): Oklch => ({ l, c, h: secondary.h });
  return {
    "50": near(0.98, Math.min(0.02, secondary.c * 0.3 + 0.01)),
    border: near(0.82, Math.min(0.08, secondary.c * 0.6 + 0.03)),
  };
}

export interface MobileResolvedBrand {
  gradientPrimary: [string, string, string];
  goldBackground: string;
  goldBorder: string;
  // Solid "lip" color behind the button face at rest (see magic-visit-app Button.tsx's `edge`) — approximated here as a plain box-shadow.
  buttonEdge: string;
}

export function deriveMobileBrand(base: ThemeBaseTokens): MobileResolvedBrand {
  const primary = parseOklch(base.primary);
  const secondary = parseOklch(base.secondary);
  const hover = lighten(primary, 0.05);
  const light = lighten(primary, 0.12);
  const edge = lighten(primary, -0.12);
  const gold = deriveGoldScale(secondary);

  return {
    gradientPrimary: [oklchToHex(primary), oklchToHex(hover), oklchToHex(light)],
    goldBackground: oklchToHex(gold["50"]),
    goldBorder: oklchToHex(gold.border),
    buttonEdge: oklchToHex(edge),
  };
}
