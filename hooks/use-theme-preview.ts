"use client";

import * as React from "react";
import { getPresetByKey, THEME_PRESETS } from "@/lib/theme/presets";
import type { ThemeBaseTokens } from "@/lib/types";

export interface ThemeDraft {
  isPreset: boolean;
  presetKey?: string;
  font: string;
  radius: number;
  light: ThemeBaseTokens;
  dark: ThemeBaseTokens;
}

const DEFAULT_PRESET = THEME_PRESETS[0];

export const DEFAULT_THEME_DRAFT: ThemeDraft = {
  isPreset: true,
  presetKey: DEFAULT_PRESET.key,
  font: DEFAULT_PRESET.font,
  radius: DEFAULT_PRESET.radius,
  light: DEFAULT_PRESET.light,
  dark: DEFAULT_PRESET.dark,
};

/**
 * Local, draft-only theme state — edits never write anywhere until an
 * explicit Save (composed with a branding draft in use-appearance-draft.ts).
 */
export function useThemePreview(initial: ThemeDraft = DEFAULT_THEME_DRAFT) {
  const [baseline, setBaseline] = React.useState(initial);
  const [draft, setDraft] = React.useState(initial);

  const hydrate = React.useCallback((next: ThemeDraft) => {
    setBaseline(next);
    setDraft(next);
  }, []);

  const setPreset = React.useCallback((presetKey: string) => {
    const preset = getPresetByKey(presetKey);
    if (!preset) return;
    setDraft({ isPreset: true, presetKey, font: preset.font, radius: preset.radius, light: preset.light, dark: preset.dark });
  }, []);

  const updateToken = React.useCallback((mode: "light" | "dark", key: keyof ThemeBaseTokens, value: string) => {
    setDraft((prev) => ({
      ...prev,
      isPreset: false,
      presetKey: undefined,
      [mode]: { ...prev[mode], [key]: value },
    }));
  }, []);

  const updateRadius = React.useCallback((radius: number) => {
    setDraft((prev) => ({ ...prev, radius }));
  }, []);

  const updateFont = React.useCallback((font: string) => {
    setDraft((prev) => ({ ...prev, font }));
  }, []);

  const reset = React.useCallback(() => setDraft(baseline), [baseline]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  return { draft, baseline, hydrate, setPreset, updateToken, updateRadius, updateFont, reset, isDirty };
}
