import type { ThemeBaseTokens } from "@/lib/types";

export interface ThemePreset {
  key: string;
  label: string;
  description: string;
  font: string;
  radius: number;
  light: ThemeBaseTokens;
  dark: ThemeBaseTokens;
}

const DEFAULT_DESTRUCTIVE = { light: "oklch(0.577 0.245 27.325)", dark: "oklch(0.704 0.191 22.216)" };

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "urmil-teal-gold",
    label: "Urmil Teal & Gold",
    description: "The current mobile app brand — deep teal with warm gold surfaces.",
    font: "Inter, ui-sans-serif, system-ui, sans-serif",
    radius: 0.625,
    light: {
      primary: "oklch(0.52 0.11 175)",
      secondary: "oklch(0.95 0.03 90)",
      accent: "oklch(0.93 0.05 85)",
      background: "oklch(0.99 0.005 90)",
      foreground: "oklch(0.18 0.02 175)",
      destructive: DEFAULT_DESTRUCTIVE.light,
    },
    dark: {
      primary: "oklch(0.62 0.12 175)",
      secondary: "oklch(0.28 0.02 175)",
      accent: "oklch(0.3 0.03 90)",
      background: "oklch(0.16 0.01 175)",
      foreground: "oklch(0.96 0.01 90)",
      destructive: DEFAULT_DESTRUCTIVE.dark,
    },
  },
  {
    key: "sapphire-slate",
    label: "Sapphire Slate",
    description: "Cool blue on crisp slate, tighter corners for a dense, businesslike feel.",
    font: "Inter, ui-sans-serif, system-ui, sans-serif",
    radius: 0.4,
    light: {
      primary: "oklch(0.5 0.15 250)",
      secondary: "oklch(0.95 0.01 250)",
      accent: "oklch(0.93 0.03 250)",
      background: "oklch(0.99 0.003 250)",
      foreground: "oklch(0.16 0.02 250)",
      destructive: DEFAULT_DESTRUCTIVE.light,
    },
    dark: {
      primary: "oklch(0.65 0.15 250)",
      secondary: "oklch(0.26 0.02 250)",
      accent: "oklch(0.28 0.04 250)",
      background: "oklch(0.15 0.015 250)",
      foreground: "oklch(0.96 0.01 250)",
      destructive: DEFAULT_DESTRUCTIVE.dark,
    },
  },
  {
    key: "sunset-coral",
    label: "Sunset Coral",
    description: "Warm coral with generously rounded corners for a friendlier, retail feel.",
    font: "Inter, ui-sans-serif, system-ui, sans-serif",
    radius: 0.9,
    light: {
      primary: "oklch(0.62 0.17 30)",
      secondary: "oklch(0.95 0.02 30)",
      accent: "oklch(0.93 0.05 30)",
      background: "oklch(0.99 0.006 30)",
      foreground: "oklch(0.2 0.02 30)",
      destructive: DEFAULT_DESTRUCTIVE.light,
    },
    dark: {
      primary: "oklch(0.68 0.16 30)",
      secondary: "oklch(0.27 0.02 30)",
      accent: "oklch(0.3 0.05 30)",
      background: "oklch(0.16 0.015 30)",
      foreground: "oklch(0.96 0.01 30)",
      destructive: DEFAULT_DESTRUCTIVE.dark,
    },
  },
  {
    key: "forest-sage",
    label: "Forest Sage",
    description: "Muted, earthy green with a calm, low-contrast feel.",
    font: "Inter, ui-sans-serif, system-ui, sans-serif",
    radius: 0.625,
    light: {
      primary: "oklch(0.45 0.09 150)",
      secondary: "oklch(0.95 0.015 150)",
      accent: "oklch(0.92 0.03 150)",
      background: "oklch(0.99 0.004 150)",
      foreground: "oklch(0.17 0.015 150)",
      destructive: DEFAULT_DESTRUCTIVE.light,
    },
    dark: {
      primary: "oklch(0.6 0.1 150)",
      secondary: "oklch(0.26 0.015 150)",
      accent: "oklch(0.28 0.03 150)",
      background: "oklch(0.15 0.01 150)",
      foreground: "oklch(0.96 0.008 150)",
      destructive: DEFAULT_DESTRUCTIVE.dark,
    },
  },
  {
    key: "midnight-violet",
    label: "Midnight Violet",
    description: "A bold violet designed dark-first — its dark mode is the primary experience.",
    font: "Inter, ui-sans-serif, system-ui, sans-serif",
    radius: 0.625,
    light: {
      primary: "oklch(0.5 0.18 290)",
      secondary: "oklch(0.95 0.02 290)",
      accent: "oklch(0.93 0.04 290)",
      background: "oklch(0.99 0.006 290)",
      foreground: "oklch(0.18 0.02 290)",
      destructive: DEFAULT_DESTRUCTIVE.light,
    },
    dark: {
      primary: "oklch(0.68 0.19 290)",
      secondary: "oklch(0.27 0.03 290)",
      accent: "oklch(0.3 0.05 290)",
      background: "oklch(0.14 0.015 290)",
      foreground: "oklch(0.96 0.01 290)",
      destructive: DEFAULT_DESTRUCTIVE.dark,
    },
  },
];

export function getPresetByKey(key: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.key === key);
}

export const FONT_OPTIONS = [
  { value: "Inter, ui-sans-serif, system-ui, sans-serif", label: "Inter (default)" },
  { value: "'Segoe UI', ui-sans-serif, system-ui, sans-serif", label: "Segoe UI" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia (serif)" },
  { value: "'Courier New', ui-monospace, monospace", label: "Courier New (mono)" },
] as const;
