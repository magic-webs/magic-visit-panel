"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheckIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateRoleSheet } from "@/components/roles/create-role-sheet";
import { useDeleteRole, useRoles } from "@/hooks/use-roles";
import { STRUCTURAL_ROLE_LABELS } from "@/lib/capabilities";
import { PanelApiError } from "@/lib/auth-bridge-client";

export default function RolesPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const { data: roles, isLoading, error } = useRoles(tenantId);
  const deleteRole = useDeleteRole(tenantId);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  async function handleDelete(roleId: string) {
    setDeleteError(null);
    try {
      await deleteRole.mutateAsync(roleId);
    } catch (err) {
      setDeleteError(err instanceof PanelApiError || err instanceof Error ? err.message : "Could not delete role.");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Roles</h2>
          <p className="text-sm text-muted-foreground">Every role staff at this tenant can be assigned, and what it can do.</p>
        </div>
        <CreateRoleSheet tenantId={tenantId} />
      </div>

      {(error || deleteError) && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{deleteError ?? error?.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : !roles || roles.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No roles yet</EmptyTitle>
            <EmptyDescription>Create the first role for this tenant.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateRoleSheet tenantId={tenantId} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Capabilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Link href={`/tenants/${tenantId}/roles/${role.id}`} className="font-medium hover:underline">
                      {role.name}
                    </Link>
                    {role.isSystem && (
                      <Badge variant="outline" className="ml-2">
                        System default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{role.key}</TableCell>
                  <TableCell className="text-muted-foreground">{STRUCTURAL_ROLE_LABELS[role.inheritsScopeFrom]}</TableCell>
                  <TableCell className="text-right tabular-nums">{role.permissions.length}</TableCell>
                  <TableCell>
                    <Badge variant={role.active ? "default" : "secondary"}>{role.active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <TrashIcon />
                        <span className="sr-only">Delete role</span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {role.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This is a soft delete — the bridge blocks it if any active staff member still holds this role, or
                            if it&apos;s the tenant&apos;s last role that can manage staff and roles.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" onClick={() => handleDelete(role.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
