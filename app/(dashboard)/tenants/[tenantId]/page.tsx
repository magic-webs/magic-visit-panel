"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useTenant, useUpdateTenant } from "@/hooks/use-tenants";
import type { TenantStatus } from "@/lib/types";

const detailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  plan: z.string().optional(),
  primaryContactEmail: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
});

type DetailsValues = z.infer<typeof detailsSchema>;

export default function TenantOverviewPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const { organization, isLoading } = useTenant(tenantId);
  const updateTenant = useUpdateTenant(tenantId);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", plan: "", primaryContactEmail: "" },
  });

  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || !organization) return;
    hydrated.current = true;
    reset({ name: organization.name, plan: organization.plan ?? "", primaryContactEmail: organization.primaryContactEmail ?? "" });
  }, [organization, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateTenant.mutateAsync({
        name: values.name,
        plan: values.plan || undefined,
        primaryContactEmail: values.primaryContactEmail || undefined,
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  });

  async function changeStatus(status: TenantStatus) {
    setSaveError(null);
    try {
      await updateTenant.mutateAsync({ status });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (isLoading || !organization) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
          <CardDescription>
            Slug <code className="rounded bg-muted px-1 py-0.5">{organization.slug}</code> and auth domain{" "}
            <code className="rounded bg-muted px-1 py-0.5">{organization.authEmailDomain}</code> are fixed at creation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent>
            {saveError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Could not save</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
            {saveSuccess && !isDirty && (
              <Alert className="mb-4">
                <AlertTitle>Saved</AlertTitle>
              </Alert>
            )}
            <FieldGroup>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Field data-invalid={!!errors.name}>
                    <FieldContent>
                      <FieldLabel htmlFor="name">Business name</FieldLabel>
                      <Input {...field} id="name" aria-invalid={!!errors.name} />
                      <FieldError errors={errors.name ? [errors.name] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="plan"
                render={({ field }) => (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="plan">Plan</FieldLabel>
                      <Input {...field} id="plan" placeholder="starter" />
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <Field data-invalid={!!errors.primaryContactEmail}>
                    <FieldContent>
                      <FieldLabel htmlFor="primaryContactEmail">Primary contact email</FieldLabel>
                      <Input {...field} id="primaryContactEmail" type="email" aria-invalid={!!errors.primaryContactEmail} />
                      <FieldError errors={errors.primaryContactEmail ? [errors.primaryContactEmail] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="gap-2" disabled={!isDirty || updateTenant.isPending}>
              {updateTenant.isPending && <Spinner />}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Suspending a tenant immediately blocks staff sign-in on the mobile app.</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          {organization.status !== "active" && (
            <Button variant="outline" onClick={() => changeStatus("active")} disabled={updateTenant.isPending}>
              Reactivate
            </Button>
          )}
          {organization.status === "active" && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>Suspend tenant</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend {organization.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Staff at this business will immediately be unable to sign in to the mobile app. You can reactivate at any
                    time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => changeStatus("suspended")}>
                    Suspend
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {organization.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>Cancel tenant</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel {organization.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This marks the business as cancelled. Existing data is kept, but it will no longer count as an active
                    tenant.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Never mind</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => changeStatus("cancelled")}>
                    Cancel tenant
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
