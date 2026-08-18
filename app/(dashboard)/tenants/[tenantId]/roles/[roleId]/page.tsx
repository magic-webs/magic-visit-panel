"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionChecklist } from "@/components/roles/permission-checklist";
import { useRole, useUpdateRole } from "@/hooks/use-roles";
import { STRUCTURAL_ROLE_LABELS, type Capability } from "@/lib/capabilities";
import { PanelApiError } from "@/lib/auth-bridge-client";

export default function RoleEditorPage({ params }: { params: Promise<{ tenantId: string; roleId: string }> }) {
  const { tenantId, roleId } = React.use(params);
  const router = useRouter();
  const { role, isLoading, error } = useRole(tenantId, roleId);
  const updateRole = useUpdateRole(tenantId);

  const [name, setName] = React.useState("");
  const [permissions, setPermissions] = React.useState<Capability[]>([]);
  const [active, setActive] = React.useState(true);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current || !role) return;
    hydrated.current = true;
    setName(role.name);
    setPermissions(role.permissions);
    setActive(role.active);
  }, [role]);

  const isDirty =
    !!role && (name !== role.name || active !== role.active || JSON.stringify([...permissions].sort()) !== JSON.stringify([...role.permissions].sort()));

  async function handleSave() {
    setSaveError(null);
    try {
      await updateRole.mutateAsync({ roleId, input: { name, permissions, active } });
    } catch (err) {
      setSaveError(err instanceof PanelApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Alert variant="destructive">
          <AlertTitle>Could not load this role</AlertTitle>
          <AlertDescription>{error?.message ?? "It may have been deleted."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/tenants/${tenantId}/roles`)}>
          <ArrowLeftIcon />
          <span className="sr-only">Back to roles</span>
        </Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{role.name}</h2>
          <p className="font-mono text-xs text-muted-foreground">{role.key}</p>
        </div>
        {role.isSystem && <Badge variant="outline">System default</Badge>}
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Field className="sm:max-w-xs">
            <FieldContent>
              <FieldLabel htmlFor="role-name">Name</FieldLabel>
              <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} />
            </FieldContent>
          </Field>
          <Field className="sm:max-w-xs">
            <FieldContent>
              <FieldLabel htmlFor="scope">Structural scope</FieldLabel>
              <Input id="scope" value={STRUCTURAL_ROLE_LABELS[role.inheritsScopeFrom]} disabled />
            </FieldContent>
          </Field>
          <label className="flex items-center gap-2 pb-1 text-sm">
            <Switch checked={active} onCheckedChange={setActive} />
            Active
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionChecklist value={permissions} onChange={setPermissions} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="gap-2" disabled={!isDirty || updateRole.isPending}>
            {updateRole.isPending && <Spinner />}
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
