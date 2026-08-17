"use client";

import * as React from "react";
import { useAppearanceDraft, type AppearanceDraft } from "@/hooks/use-appearance-draft";

const AppearanceContext = React.createContext<AppearanceDraft | null>(null);

// Instantiated ONCE by the (appearance) split layout so draft state (both
// theme AND branding) survives switching between the Theme and Branding
// tabs — each tab page just reads this context instead of re-running
// useAppearanceDraft itself, which would otherwise reset on navigation.
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

// Which of light/dark the shared ThemePreview pane renders right now — kept
// alongside the appearance draft (not inside it) since it's pure UI state,
// not something that gets saved. The Theme tab's Tabs control writes to
// this so switching "Light"/"Dark" there also flips the live preview.
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
