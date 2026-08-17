"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatOklch, hexToOklch, oklchToHex, parseOklch } from "@/lib/theme/oklch";
import { cn } from "@/lib/utils";

// A swatch Button -> Popover with a native <input type="color"> synced
// through lib/theme/oklch.ts, plus a manual OKLCH text field for precise
// entry. Every base token in the editor is edited through this one control.
export function ColorSwatchPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [textValue, setTextValue] = React.useState(value);
  // Re-sync the draft text field when `value` changes from outside (preset
  // switch, revert) — adjusted during render (React's documented pattern for
  // this) rather than in an effect, so there's no extra commit in between.
  const [lastValue, setLastValue] = React.useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setTextValue(value);
  }

  const hex = React.useMemo(() => {
    try {
      return oklchToHex(parseOklch(value));
    } catch {
      return "#000000";
    }
  }, [value]);

  function handleHexChange(nextHex: string) {
    onChange(formatOklch(hexToOklch(nextHex)));
  }

  function commitText() {
    try {
      onChange(formatOklch(parseOklch(textValue)));
    } catch {
      setTextValue(value);
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-input p-2 text-left text-sm shadow-xs transition-colors hover:bg-muted",
        )}
      >
        <span className="size-6 shrink-0 rounded-full border border-border" style={{ backgroundColor: hex }} aria-hidden />
        <span className="flex-1 truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="flex w-64 flex-col gap-3">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <input
          type="color"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-md border border-input"
          aria-label={`${label} color picker`}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`oklch-${label}`} className="text-xs text-muted-foreground">
            OKLCH
          </Label>
          <Input
            id={`oklch-${label}`}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            className="font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
