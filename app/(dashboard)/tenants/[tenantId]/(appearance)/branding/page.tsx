"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { LogoUploader } from "@/components/branding/logo-uploader";
import { LivePreviewLink } from "@/components/branding/live-preview-link";
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
            placeholder="Enter app name"
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
            placeholder="Enter short name"
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

      {organization && (
        <LivePreviewLink tenantId={tenantId} tenantSlug={organization.slug} customDomain={draft.brandingDraft.customDomain} />
      )}

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

      <p className="text-xs text-muted-foreground">
        Ready to ship this tenant&apos;s app? Head to <span className="font-medium text-foreground">Export</span> to
        build the APK or deploy the web build.
      </p>
    </div>
  );
}
