"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppearanceProvider, PreviewModeProvider, useAppearanceContext } from "@/components/theme/appearance-context";
import { MobilePreview } from "@/components/theme/mobile-preview";

// Split layout (editor left, live MobilePreview right) shared across Theme/Branding tabs via
// AppearanceProvider so draft state survives tab switches; only Save commits it via PUT config.
// PreviewModeProvider's Light/Dark switch controls which token set is being EDITED, not what
// MobilePreview renders — it's always light (the mobile app has no dark mode yet).
export default function AppearanceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  return (
    <AppearanceProvider tenantId={tenantId}>
      <PreviewModeProvider>
        <AppearanceShell tenantId={tenantId}>{children}</AppearanceShell>
      </PreviewModeProvider>
    </AppearanceProvider>
  );
}

function AppearanceShell({ tenantId, children }: { tenantId: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const draft = useAppearanceContext();
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const activeTab = pathname.endsWith("/branding") ? "branding" : "theme";

  async function handleSave() {
    setSaveError(null);
    try {
      await draft.save();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (draft.isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6 lg:flex-row lg:gap-6">
        <Skeleton className="h-96 flex-1 lg:max-w-md" />
        <Skeleton className="h-96 flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex flex-1 flex-col gap-4 lg:max-w-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={activeTab} onValueChange={(value) => router.push(`/tenants/${tenantId}/${value}`)}>
            <TabsList>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            {draft.isDirty && (
              <Button variant="outline" size="sm" onClick={draft.reset} disabled={draft.isSaving}>
                Revert
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!draft.isDirty || draft.isSaving}>
              {draft.isSaving && <Spinner />}
              Save
            </Button>
          </div>
        </div>

        {saveError && (
          <Alert variant="destructive">
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {children}
      </div>

      <div className="flex-1 lg:sticky lg:top-6">
        <MobilePreview
          theme={draft.themeDraft}
          appName={draft.brandingDraft.appName || "Your App"}
          shortName={draft.brandingDraft.shortName || undefined}
          logoUrl={draft.resolvedPreviews.logoLight}
        />
      </div>
    </div>
  );
}
