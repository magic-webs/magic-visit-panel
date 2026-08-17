"use client";

import * as React from "react";
import { useTenantConfig, useSaveTenantConfig } from "@/hooks/use-tenant-config";
import { useThemePreview, DEFAULT_THEME_DRAFT, type ThemeDraft } from "@/hooks/use-theme-preview";
import type { TenantConfigInput } from "@/lib/types";

export interface BrandingDraft {
  appName: string;
  shortName: string;
  logoLightFileId?: string;
  logoDarkFileId?: string;
  iconFileId?: string;
  customDomain: string;
}

const DEFAULT_BRANDING_DRAFT: BrandingDraft = { appName: "", shortName: "", customDomain: "" };

export type LogoSlot = "logoLight" | "logoDark" | "icon";

/**
 * Tracks THEME and BRANDING draft state together in one place, backed by a
 * single tenant. The (appearance) split layout mounts this once and shares
 * it across the Theme and Branding tabs (via React context — see
 * app/(dashboard)/tenants/[tenantId]/(appearance)/layout.tsx) so switching
 * tabs never loses in-progress edits, and both save through the one atomic
 * PUT /api/tenants/[tenantId]/config call.
 */
export function useAppearanceDraft(tenantId: string) {
  const configQuery = useTenantConfig(tenantId);
  const saveMutation = useSaveTenantConfig(tenantId);
  const theme = useThemePreview();

  const [brandingBaseline, setBrandingBaseline] = React.useState<BrandingDraft>(DEFAULT_BRANDING_DRAFT);
  const [brandingDraft, setBrandingDraft] = React.useState<BrandingDraft>(DEFAULT_BRANDING_DRAFT);
  // Local object URLs for not-yet-uploaded logo files, so the preview
  // updates instantly while db.storage.uploadFile() is still in flight.
  const [previews, setPreviews] = React.useState<Partial<Record<LogoSlot, string>>>({});
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current || !configQuery.data) return;
    hydrated.current = true;

    const { theme: themeRow, branding } = configQuery.data;
    const nextTheme: ThemeDraft = themeRow
      ? {
          isPreset: themeRow.isPreset,
          presetKey: themeRow.presetKey,
          font: themeRow.font,
          radius: themeRow.radius,
          light: themeRow.light,
          dark: themeRow.dark,
        }
      : DEFAULT_THEME_DRAFT;
    const nextBranding: BrandingDraft = branding
      ? {
          appName: branding.appName,
          shortName: branding.shortName ?? "",
          logoLightFileId: branding.logoLightFileId,
          logoDarkFileId: branding.logoDarkFileId,
          iconFileId: branding.iconFileId,
          customDomain: branding.customDomain ?? "",
        }
      : DEFAULT_BRANDING_DRAFT;

    theme.hydrate(nextTheme);
    setBrandingDraft(nextBranding);
    setBrandingBaseline(nextBranding);
    // theme.hydrate is stable (useCallback with no deps) — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configQuery.data]);

  const updateBranding = React.useCallback((patch: Partial<BrandingDraft>) => {
    setBrandingDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const setPreview = React.useCallback((slot: LogoSlot, url: string) => {
    setPreviews((prev) => ({ ...prev, [slot]: url }));
  }, []);

  const isDirty = theme.isDirty || JSON.stringify(brandingDraft) !== JSON.stringify(brandingBaseline);

  const reset = React.useCallback(() => {
    theme.reset();
    setBrandingDraft(brandingBaseline);
    setPreviews({});
    // theme.reset is stable given `theme.baseline` — omitted to avoid a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandingBaseline]);

  const save = React.useCallback(async () => {
    const input: TenantConfigInput = {
      theme: theme.draft,
      branding: {
        appName: brandingDraft.appName,
        shortName: brandingDraft.shortName || undefined,
        logoLightFileId: brandingDraft.logoLightFileId,
        logoDarkFileId: brandingDraft.logoDarkFileId,
        iconFileId: brandingDraft.iconFileId,
        customDomain: brandingDraft.customDomain || undefined,
      },
    };
    await saveMutation.mutateAsync(input);
    theme.hydrate(theme.draft);
    setBrandingBaseline(brandingDraft);
    // theme.draft/theme.hydrate intentionally the only theme deps tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.draft, brandingDraft, saveMutation]);

  return {
    isLoading: configQuery.isLoading,
    loadError: configQuery.error,
    themeDraft: theme.draft,
    setPreset: theme.setPreset,
    updateToken: theme.updateToken,
    updateRadius: theme.updateRadius,
    updateFont: theme.updateFont,
    brandingDraft,
    updateBranding,
    previews,
    setPreview,
    isDirty,
    reset,
    save,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
}

export type AppearanceDraft = ReturnType<typeof useAppearanceDraft>;
