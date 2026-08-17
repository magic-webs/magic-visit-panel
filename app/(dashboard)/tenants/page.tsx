"use client";

import Link from "next/link";
import { Building2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateTenantSheet } from "@/components/tenants/create-tenant-sheet";
import { useTenants } from "@/hooks/use-tenants";
import type { TenantStatus } from "@/lib/types";

const STATUS_VARIANT: Record<TenantStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trial: "secondary",
  suspended: "destructive",
  cancelled: "outline",
};

export default function TenantsPage() {
  const { tenants, isLoading, error } = useTenants();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground">Every business running on Magic Visit CRM.</p>
        </div>
        <CreateTenantSheet />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load tenants</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>No tenants yet</EmptyTitle>
            <EmptyDescription>Create the first business to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateTenantSheet />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead className="text-right">Branches</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/tenants/${tenant.id}`} className="font-medium hover:underline">
                      {tenant.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tenant.slug}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[tenant.status]} className="capitalize">
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tenant.plan ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{tenant.staffCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{tenant.branchCount}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
