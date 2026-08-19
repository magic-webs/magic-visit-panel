"use client";

import * as React from "react";
import { ImageIcon, UploadIcon } from "lucide-react";

import { db } from "@/lib/instant";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { LogoSlot } from "@/hooks/use-appearance-draft";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

function useFileUrl(fileId: string | undefined) {
  const { data } = db.useQuery(fileId ? { $files: { $: { where: { id: fileId } } } } : null);
  return data?.$files?.[0]?.url as string | undefined;
}

export function LogoUploader({
  tenantId,
  slot,
  label,
  description,
  currentFileId,
  previewUrl,
  onUploaded,
  onPreview,
}: {
  tenantId: string;
  slot: LogoSlot;
  label: string;
  description: string;
  currentFileId?: string;
  previewUrl?: string;
  onUploaded: (fileId: string) => void;
  onPreview: (url: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const savedUrl = useFileUrl(currentFileId);
  const displayUrl = previewUrl ?? savedUrl;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPEG, WebP, or SVG file.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("File must be 2MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onPreview(objectUrl);

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `branding/${tenantId}/${slot}-${Date.now()}.${ext}`;
      const result = await db.storage.uploadFile(path, file, { contentType: file.type });
      onUploaded(result.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Stacked, not side-by-side — a 3-up grid in a max-w-md column is too narrow for label + description on one row. */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Card
        size="sm"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-4 text-center transition-colors hover:bg-muted/50",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt={label} className="h-16 w-16 rounded object-contain" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
        <Button type="button" variant="outline" size="sm" disabled={isUploading}>
          {isUploading ? <Spinner /> : <UploadIcon />}
          {displayUrl ? "Replace" : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </Card>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
