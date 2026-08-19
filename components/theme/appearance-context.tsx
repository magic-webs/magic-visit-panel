"use client";

import * as React from "react";
import { useAppearanceDraft, type AppearanceDraft } from "@/hooks/use-appearance-draft";

const AppearanceContext = React.createContext<AppearanceDraft | null>(null);

// Instantiated once by the (appearance) layout so draft state survives
// switching Theme/Branding tabs instead of resetting on navigation.
export function AppearanceProvider({ tenantId, children }: { tenantId: string; children: React.ReactNode }) {
  const draft = useAppearanceDraft(tenantId);
  return <AppearanceContext.Provider value={draft}>{children}</AppearanceContext.Provider>;
}

export function useAppearanceContext(): AppearanceDraft {
  const context = React.useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearanceContext must be used within the (appearance) route group.");
  }
  return context;
}

export interface PreviewModeState {
  previewMode: "light" | "dark";
  setPreviewMode: (mode: "light" | "dark") => void;
}

const PreviewModeContext = React.createContext<PreviewModeState | null>(null);

// Which mode the shared ThemePreview pane renders — kept separate from the
// appearance draft since it's pure UI state, never saved.
export function PreviewModeProvider({ children }: { children: React.ReactNode }) {
  const [previewMode, setPreviewMode] = React.useState<"light" | "dark">("light");
  const value = React.useMemo(() => ({ previewMode, setPreviewMode }), [previewMode]);
  return <PreviewModeContext.Provider value={value}>{children}</PreviewModeContext.Provider>;
}

export function usePreviewMode(): PreviewModeState {
  const context = React.useContext(PreviewModeContext);
  if (!context) {
    throw new Error("usePreviewMode must be used within the (appearance) route group.");
  }
  return context;
}
