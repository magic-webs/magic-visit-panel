"use client";

import { ThemeEditor } from "@/components/theme/theme-editor";
import { useAppearanceContext, usePreviewMode } from "@/components/theme/appearance-context";

export default function ThemePage() {
  const draft = useAppearanceContext();
  const { previewMode, setPreviewMode } = usePreviewMode();

  return (
    <ThemeEditor
      draft={draft.themeDraft}
      mode={previewMode}
      onModeChange={setPreviewMode}
      onSetPreset={draft.setPreset}
      onUpdateToken={draft.updateToken}
      onUpdateRadius={draft.updateRadius}
      onUpdateFont={draft.updateFont}
    />
  );
}
