"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PermissionChecklist } from "@/components/roles/permission-checklist";
import { useCreateRole, useRoles } from "@/hooks/use-roles";
import { STRUCTURAL_ROLE_LABELS, STRUCTURAL_ROLES, type Capability, type StructuralRole } from "@/lib/capabilities";
import { PanelApiError } from "@/lib/auth-bridge-client";

const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required."),
  key: z
    .string()
    .min(1, "Key is required.")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only."),
  inheritsScopeFrom: z.enum(STRUCTURAL_ROLES),
});

type CreateRoleValues = z.infer<typeof createRoleSchema>;

function slugifyKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function CreateRoleSheet({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = React.useState(false);
  const [keyTouched, setKeyTouched] = React.useState(false);
  const [permissions, setPermissions] = React.useState<Capability[]>([]);
  const [cloneFromRoleId, setCloneFromRoleId] = React.useState<string | undefined>(undefined);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { data: roles } = useRoles(tenantId);
  const createRole = useCreateRole(tenantId);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRoleValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", key: "", inheritsScopeFrom: "branch_manager" },
  });

  const nameValue = useWatch({ control, name: "name" });
  React.useEffect(() => {
    if (!keyTouched) {
      setValue("key", slugifyKey(nameValue ?? ""));
    }
  }, [nameValue, keyTouched, setValue]);

  function applyClone(roleId: string | null) {
    setCloneFromRoleId(roleId ?? undefined);
    const source = roles?.find((role) => role.id === roleId);
    if (source) {
      setPermissions(source.permissions);
      setValue("inheritsScopeFrom", source.inheritsScopeFrom as StructuralRole);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createRole.mutateAsync({
        name: values.name,
        key: values.key,
        inheritsScopeFrom: values.inheritsScopeFrom,
        permissions,
        cloneFromRoleId,
      });
      setOpen(false);
      reset();
      setKeyTouched(false);
      setPermissions([]);
      setCloneFromRoleId(undefined);
    } catch (err) {
      setFormError(err instanceof PanelApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <PlusIcon />
        Create role
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create a role</SheetTitle>
          <SheetDescription>Roles are scoped to this tenant. Pick a structural scope and the capabilities it grants.</SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4" noValidate>
          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Could not create role</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field data-invalid={!!errors.name}>
                  <FieldContent>
                    <FieldLabel htmlFor="role-name">Name</FieldLabel>
                    <Input {...field} id="role-name" placeholder="Senior Salesperson" aria-invalid={!!errors.name} />
                    <FieldError errors={errors.name ? [errors.name] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="key"
              render={({ field }) => (
                <Field data-invalid={!!errors.key}>
                  <FieldContent>
                    <FieldLabel htmlFor="role-key">Key</FieldLabel>
                    <Input
                      {...field}
                      id="role-key"
                      placeholder="senior_salesperson"
                      aria-invalid={!!errors.key}
                      onChange={(e) => {
                        setKeyTouched(true);
                        field.onChange(e);
                      }}
                    />
                    <FieldError errors={errors.key ? [errors.key] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="inheritsScopeFrom"
              render={({ field }) => (
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="inheritsScopeFrom">Structural scope</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="inheritsScopeFrom" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRUCTURAL_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {STRUCTURAL_ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )}
            />

            {roles && roles.length > 0 && (
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="clone-from">Start from an existing role (optional)</FieldLabel>
                  <Select value={cloneFromRoleId} onValueChange={applyClone}>
                    <SelectTrigger id="clone-from" className="w-full">
                      <SelectValue placeholder="Start from scratch" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          </FieldGroup>

          <div>
            <p className="mb-3 text-sm font-medium">Capabilities</p>
            <PermissionChecklist value={permissions} onChange={setPermissions} />
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={createRole.isPending}>
              {createRole.isPending && <Spinner />}
              Create role
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
