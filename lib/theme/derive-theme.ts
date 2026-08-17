// Computes every shadcn CSS variable that ISN'T one of the 6 editable base
// tokens (see ThemeBaseTokens) from those 6 tokens alone. The panel never
// lets a tenant edit card/popover/muted/border/input/ring/chart-*/sidebar-*
// directly — they're always a function of primary/secondary/accent/
// background/foreground/destructive, the same way globals.css's own
// light/dark defaults relate to each other (verified token-by-token against
// app/globals.css's current values with base tokens fixed to the neutral
// scaffold — see the constants below).
import { formatOklch, mixOklch, parseOklch, type Oklch } from "@/lib/theme/oklch";
import { getChartPalette } from "@/lib/theme/chart-palette-bank";
import type { ThemeBaseTokens } from "@/lib/types";

export interface FullTokenSet {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
}

// Two fixed contrast targets, matching the exact "near white" / "near black"
// shades app/globals.css's own default (grayscale) theme uses for
// primary-foreground/secondary-foreground/accent-foreground — reproduced
// here token-for-token when base tokens are left at that neutral default.
const NEAR_WHITE: Oklch = { l: 0.985, c: 0, h: 0 };
const NEAR_BLACK: Oklch = { l: 0.205, c: 0, h: 0 };
const CONTRAST_THRESHOLD = 0.6;

function contrastForeground(color: Oklch): Oklch {
  return color.l < CONTRAST_THRESHOLD ? NEAR_WHITE : NEAR_BLACK;
}

function clampL(l: number): number {
  return Math.min(1, Math.max(0, l));
}

// One-step-off constants, solved against app/globals.css's own light/dark
// pairs (card vs background differ by +0.06 L in dark mode and 0 in light;
// the sidebar's own step is smaller/negative in light, +0.06 in dark).
const CARD_STEP = { light: 0, dark: 0.06 };
const SIDEBAR_STEP = { light: -0.015, dark: 0.06 };

// Mix weights toward `foreground`, solved the same way against the default
// scaffold's muted/muted-foreground/border/ring values.
const MUTED_BG_WEIGHT = { light: 0.035, dark: 0.15 };
const MUTED_FG_WEIGHT = { light: 0.52, dark: 0.67 };
const BORDER_WEIGHT = { light: 0.09, dark: 0.09 }; // dark uses the alpha-overlay path instead, see below
const RING_WEIGHT = { light: 0.34, dark: 0.49 };

function deriveMuted(background: Oklch, foreground: Oklch, primary: Oklch, mode: "light" | "dark"): { bg: Oklch; fg: Oklch } {
  const bgWeight = MUTED_BG_WEIGHT[mode];
  const fgWeight = MUTED_FG_WEIGHT[mode];
  const bgMixed = mixOklch(background, foreground, bgWeight);
  const fgMixed = mixOklch(background, foreground, fgWeight);
  return {
    // A faint hint of the tenant's own primary hue keeps neutral surfaces
    // from reading as a totally generic gray, mirroring how many hand-tuned
    // shadcn themes lightly tint muted/ring toward the brand color.
    bg: { l: bgMixed.l, c: Math.min(0.02, primary.c * 0.06), h: primary.h },
    fg: { l: fgMixed.l, c: Math.min(0.01, primary.c * 0.03), h: primary.h },
  };
}

function deriveRing(background: Oklch, foreground: Oklch, primary: Oklch, mode: "light" | "dark"): Oklch {
  const mixed = mixOklch(background, foreground, RING_WEIGHT[mode]);
  return { l: mixed.l, c: Math.min(0.08, primary.c * 0.35), h: primary.h };
}

function deriveBorderLike(background: Oklch, foreground: Oklch, mode: "light" | "dark", alphaPercent: number): Oklch {
  if (mode === "dark") {
    // Mirrors app/globals.css's own dark-mode pattern exactly: a translucent
    // near-white overlay rather than a flat opaque gray, since dark UIs read
    // better as a lightening wash over whatever sits underneath.
    return { l: 1, c: 0, h: 0, alpha: alphaPercent / 100 };
  }
  const mixed = mixOklch(background, foreground, BORDER_WEIGHT.light);
  return { l: mixed.l, c: mixed.c, h: mixed.h };
}

export function deriveFullTokenSet(base: ThemeBaseTokens, mode: "light" | "dark"): FullTokenSet {
  const background = parseOklch(base.background);
  const foreground = parseOklch(base.foreground);
  const primary = parseOklch(base.primary);
  const secondary = parseOklch(base.secondary);
  const accent = parseOklch(base.accent);
  const destructive = parseOklch(base.destructive);

  const cardL = clampL(background.l + CARD_STEP[mode]);
  const card: Oklch = { l: cardL, c: background.c, h: background.h };
  const popover = card;

  const primaryForeground = contrastForeground(primary);
  const secondaryForeground = contrastForeground(secondary);
  const accentForeground = contrastForeground(accent);

  const muted = deriveMuted(background, foreground, primary, mode);
  const ring = deriveRing(background, foreground, primary, mode);
  const border = deriveBorderLike(background, foreground, mode, 10);
  const input = deriveBorderLike(background, foreground, mode, 15);

  const sidebarL = clampL(background.l + SIDEBAR_STEP[mode]);
  const sidebar: Oklch = { l: sidebarL, c: background.c, h: background.h };
  const sidebarPrimary: Oklch = {
    l: clampL(primary.l + (mode === "dark" ? 0.08 : 0)),
    c: primary.c,
    h: primary.h,
  };
  const sidebarPrimaryForeground = contrastForeground(sidebarPrimary);
  const sidebarAccent = accent;
  const sidebarAccentForeground = accentForeground;

  const [chart1, chart2, chart3, chart4, chart5] = getChartPalette(primary, mode);

  return {
    background: formatOklch(background),
    foreground: formatOklch(foreground),
    card: formatOklch(card),
    "card-foreground": formatOklch(foreground),
    popover: formatOklch(popover),
    "popover-foreground": formatOklch(foreground),
    primary: formatOklch(primary),
    "primary-foreground": formatOklch(primaryForeground),
    secondary: formatOklch(secondary),
    "secondary-foreground": formatOklch(secondaryForeground),
    muted: formatOklch(muted.bg),
    "muted-foreground": formatOklch(muted.fg),
    accent: formatOklch(accent),
    "accent-foreground": formatOklch(accentForeground),
    destructive: formatOklch(destructive),
    border: formatOklch(border),
    input: formatOklch(input),
    ring: formatOklch(ring),
    "chart-1": formatOklch(chart1),
    "chart-2": formatOklch(chart2),
    "chart-3": formatOklch(chart3),
    "chart-4": formatOklch(chart4),
    "chart-5": formatOklch(chart5),
    sidebar: formatOklch(sidebar),
    "sidebar-foreground": formatOklch(foreground),
    "sidebar-primary": formatOklch(sidebarPrimary),
    "sidebar-primary-foreground": formatOklch(sidebarPrimaryForeground),
    "sidebar-accent": formatOklch(sidebarAccent),
    "sidebar-accent-foreground": formatOklch(sidebarAccentForeground),
    "sidebar-border": formatOklch(border),
    "sidebar-ring": formatOklch(ring),
  };
}

/** Turns a FullTokenSet into a `{ "--background": "oklch(...)", ... }` map, ready to spread into a React inline `style` object. */
export function tokenSetToCssVars(tokens: FullTokenSet, extra?: { radius?: number; font?: string }): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    vars[`--${key}`] = value;
  }
  if (extra?.radius !== undefined) {
    vars["--radius"] = `${extra.radius}rem`;
  }
  if (extra?.font) {
    vars["--font-sans"] = extra.font;
  }
  return vars;
}
