"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ColorSwatchPicker } from "@/components/theme/color-swatch-picker";
import { THEME_PRESETS, FONT_OPTIONS } from "@/lib/theme/presets";
import { oklchToHex, parseOklch } from "@/lib/theme/oklch";
import { cn } from "@/lib/utils";
import type { ThemeDraft } from "@/hooks/use-theme-preview";
import type { ThemeBaseTokens } from "@/lib/types";

const TOKEN_FIELDS: Array<{ key: keyof ThemeBaseTokens; label: string }> = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "destructive", label: "Destructive" },
];

export function ThemeEditor({
  draft,
  mode,
  onModeChange,
  onSetPreset,
  onUpdateToken,
  onUpdateRadius,
  onUpdateFont,
}: {
  draft: ThemeDraft;
  mode: "light" | "dark";
  onModeChange: (mode: "light" | "dark") => void;
  onSetPreset: (key: string) => void;
  onUpdateToken: (mode: "light" | "dark", key: keyof ThemeBaseTokens, value: string) => void;
  onUpdateRadius: (radius: number) => void;
  onUpdateFont: (font: string) => void;
}) {
  const activeTokens = mode === "dark" ? draft.dark : draft.light;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label className="text-sm">Preset</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {THEME_PRESETS.map((preset) => {
            const isActive = draft.isPreset && draft.presetKey === preset.key;
            let hex = "#888888";
            try {
              hex = oklchToHex(parseOklch(preset.light.primary));
            } catch {
              // keep fallback
            }
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => onSetPreset(preset.key)}
                title={preset.label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors hover:bg-muted",
                  isActive && "border-primary bg-primary/5",
                )}
              >
                <span className="relative flex size-7 items-center justify-center rounded-full border" style={{ backgroundColor: hex }}>
                  {isActive && <CheckIcon className="size-3.5 text-white drop-shadow" />}
                </span>
                <span className="w-full truncate text-center">{preset.label.split(" ")[0]}</span>
              </button>
            );
          })}
          <div
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border border-dashed p-2 text-xs text-muted-foreground",
              !draft.isPreset && "border-primary text-foreground",
            )}
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-dashed">{!draft.isPreset && <CheckIcon className="size-3.5" />}</span>
            <span>Custom</span>
          </div>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => onModeChange(value as "light" | "dark")}>
        <TabsList>
          <TabsTrigger value="light">Light</TabsTrigger>
          <TabsTrigger value="dark">Dark</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="mt-4 flex flex-col gap-2">
          {TOKEN_FIELDS.map((tokenField) => (
            <ColorSwatchPicker
              key={tokenField.key}
              label={tokenField.label}
              value={activeTokens[tokenField.key]}
              onChange={(value) => onUpdateToken(mode, tokenField.key, value)}
            />
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Corner radius</Label>
          <span className="text-xs text-muted-foreground">{draft.radius.toFixed(3)}rem</span>
        </div>
        <Slider
          min={0}
          max={1.5}
          step={0.025}
          value={[draft.radius]}
          onValueChange={(value) => onUpdateRadius(Array.isArray(value) ? value[0] : value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="font-select" className="text-sm">
          Font
        </Label>
        <NativeSelect id="font-select" value={draft.font} onChange={(e) => onUpdateFont(e.target.value)}>
          {FONT_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
