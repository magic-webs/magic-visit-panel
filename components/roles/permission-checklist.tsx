"use client";

import { CAPABILITY_GROUPS, CAPABILITY_LABELS, type Capability } from "@/lib/capabilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// A resource-area grouping (Visitor Logs, Customers, Staff & Roles, Branches,
// Discounts, Offers, Performance, Analytics) rather than a strict CRUD
// matrix — several capabilities (can_approve_discounts, can_view_analytics)
// don't map onto uniform create/read/update/delete slots at all.
export function PermissionChecklist({
  value,
  onChange,
  disabled,
}: {
  value: Capability[];
  onChange: (next: Capability[]) => void;
  disabled?: boolean;
}) {
  const selected = new Set(value);

  function toggle(capability: Capability, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(capability);
    else next.delete(capability);
    onChange(Array.from(next));
  }

  function toggleGroup(capabilities: Capability[], checked: boolean) {
    const next = new Set(selected);
    for (const capability of capabilities) {
      if (checked) next.add(capability);
      else next.delete(capability);
    }
    onChange(Array.from(next));
  }

  return (
    <div className="flex flex-col gap-5">
      {CAPABILITY_GROUPS.map((group, index) => {
        const allSelected = group.capabilities.every((capability) => selected.has(capability));
        const someSelected = group.capabilities.some((capability) => selected.has(capability));

        return (
          <div key={group.key} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground select-none">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={(checked) => toggleGroup(group.capabilities, checked)}
                  disabled={disabled}
                />
                Select all
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.capabilities.map((capability) => (
                <label
                  key={capability}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
                >
                  <Checkbox
                    checked={selected.has(capability)}
                    onCheckedChange={(checked) => toggle(capability, checked)}
                    disabled={disabled}
                  />
                  {CAPABILITY_LABELS[capability]}
                </label>
              ))}
            </div>
            {index < CAPABILITY_GROUPS.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  );
}
