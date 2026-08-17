"use client";

import * as React from "react";
import { Rocket } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { LogoUploader } from "@/components/branding/logo-uploader";
import { LivePreviewLink } from "@/components/branding/live-preview-link";
import { CreateApkButton } from "@/components/branding/create-apk-button";
import { useAppearanceContext } from "@/components/theme/appearance-context";
import { useTenant } from "@/hooks/use-tenants";

export default function BrandingPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const draft = useAppearanceContext();
  const { organization } = useTenant(tenantId);

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldContent>
          <FieldLabel htmlFor="appName">App name</FieldLabel>
          <Input
            id="appName"
            value={draft.brandingDraft.appName}
            onChange={(e) => draft.updateBranding({ appName: e.target.value })}
            placeholder="Urmil Jewellers"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel htmlFor="shortName">Short name (optional)</FieldLabel>
          <Input
            id="shortName"
            value={draft.brandingDraft.shortName}
            onChange={(e) => draft.updateBranding({ shortName: e.target.value })}
            placeholder="Urmil"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel htmlFor="customDomain">Custom domain (optional)</FieldLabel>
          <Input
            id="customDomain"
            value={draft.brandingDraft.customDomain}
            onChange={(e) => draft.updateBranding({ customDomain: e.target.value })}
            placeholder="app.example.com"
          />
          <p className="text-xs text-muted-foreground">
            Where this tenant&apos;s installable web app is hosted. Stored for the web shell&apos;s title/manifest and
            future custom-domain hosting — DNS and certificates are set up separately.
          </p>
        </FieldContent>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {organization ? (
          <LivePreviewLink tenantId={tenantId} tenantSlug={organization.slug} customDomain={draft.brandingDraft.customDomain} />
        ) : (
          <div className="rounded-lg border p-4" />
        )}
        <div className="flex flex-col justify-between gap-2 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Android build</p>
            <p className="text-xs text-muted-foreground">
              Starts/monitors a build on EAS using this project&apos;s existing &quot;preview&quot; profile
              (internal distribution — installable APK, no store submission).
            </p>
          </div>
          <div>
            {organization ? (
              <CreateApkButton tenantId={tenantId} tenantSlug={organization.slug} />
            ) : (
              <Button size="sm" disabled>
                <Rocket className="size-4" /> Create APK
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LogoUploader
          tenantId={tenantId}
          slot="logoLight"
          label="Logo (light)"
          description="Shown on light backgrounds"
          currentFileId={draft.brandingDraft.logoLightFileId}
          previewUrl={draft.previews.logoLight}
          onPreview={(url) => draft.setPreview("logoLight", url)}
          onUploaded={(fileId) => draft.updateBranding({ logoLightFileId: fileId })}
        />
        <LogoUploader
          tenantId={tenantId}
          slot="logoDark"
          label="Logo (dark)"
          description="Shown on dark backgrounds"
          currentFileId={draft.brandingDraft.logoDarkFileId}
          previewUrl={draft.previews.logoDark}
          onPreview={(url) => draft.setPreview("logoDark", url)}
          onUploaded={(fileId) => draft.updateBranding({ logoDarkFileId: fileId })}
        />
        <LogoUploader
          tenantId={tenantId}
          slot="icon"
          label="Icon"
          description="Favicon / app icon"
          currentFileId={draft.brandingDraft.iconFileId}
          previewUrl={draft.previews.icon}
          onPreview={(url) => draft.setPreview("icon", url)}
          onUploaded={(fileId) => draft.updateBranding({ iconFileId: fileId })}
        />
      </div>
    </div>
  );
}
