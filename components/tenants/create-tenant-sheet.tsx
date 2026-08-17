"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateTenant } from "@/hooks/use-tenants";
import { PanelApiError } from "@/lib/auth-bridge-client";

const createTenantSchema = z.object({
  name: z.string().min(1, "Business name is required."),
  slug: z
    .string()
    .min(2, "At least 2 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  plan: z.string().optional(),
  primaryContactEmail: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
  ownerName: z.string().min(1, "Owner name is required."),
  ownerMobile: z.string().min(10, "Enter a valid mobile number."),
  ownerPassword: z.string().min(6, "At least 6 characters."),
});

type CreateTenantValues = z.infer<typeof createTenantSchema>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateTenantSheet() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const createTenant = useCreateTenant();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTenantValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", slug: "", plan: "", primaryContactEmail: "", ownerName: "", ownerMobile: "", ownerPassword: "" },
  });

  const nameValue = useWatch({ control, name: "name" });
  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue ?? ""));
    }
  }, [nameValue, slugTouched, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await createTenant.mutateAsync({
        name: values.name,
        slug: values.slug,
        plan: values.plan || undefined,
        primaryContactEmail: values.primaryContactEmail || undefined,
        ownerName: values.ownerName,
        ownerMobile: values.ownerMobile,
        ownerPassword: values.ownerPassword,
      });
      setOpen(false);
      reset();
      setSlugTouched(false);
      router.push(`/tenants/${created.id}`);
    } catch (err) {
      setFormError(err instanceof PanelApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormError(null);
        }
      }}
    >
      <SheetTrigger render={<Button />}>
        <PlusIcon />
        New tenant
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create a new tenant</SheetTitle>
          <SheetDescription>
            This creates the business, seeds its 5 default roles, and creates the first owner account that can sign in to the
            mobile app.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4" noValidate>
          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Could not create tenant</AlertTitle>
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
                    <FieldLabel htmlFor="name">Business name</FieldLabel>
                    <Input {...field} id="name" placeholder="Urmil Jewellers" aria-invalid={!!errors.name} />
                    <FieldError errors={errors.name ? [errors.name] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="slug"
              render={({ field }) => (
                <Field data-invalid={!!errors.slug}>
                  <FieldContent>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <Input
                      {...field}
                      id="slug"
                      placeholder="urmil-jewellers"
                      aria-invalid={!!errors.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        field.onChange(e);
                      }}
                    />
                    <FieldError errors={errors.slug ? [errors.slug] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="plan"
              render={({ field }) => (
                <Field data-invalid={!!errors.plan}>
                  <FieldContent>
                    <FieldLabel htmlFor="plan">Plan (optional)</FieldLabel>
                    <Input {...field} id="plan" placeholder="starter" aria-invalid={!!errors.plan} />
                    <FieldError errors={errors.plan ? [errors.plan] : undefined} />
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
                    <FieldLabel htmlFor="primaryContactEmail">Primary contact email (optional)</FieldLabel>
                    <Input
                      {...field}
                      id="primaryContactEmail"
                      type="email"
                      placeholder="owner@example.com"
                      aria-invalid={!!errors.primaryContactEmail}
                    />
                    <FieldError errors={errors.primaryContactEmail ? [errors.primaryContactEmail] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <FieldSeparator>First owner account</FieldSeparator>

            <Controller
              control={control}
              name="ownerName"
              render={({ field }) => (
                <Field data-invalid={!!errors.ownerName}>
                  <FieldContent>
                    <FieldLabel htmlFor="ownerName">Owner name</FieldLabel>
                    <Input {...field} id="ownerName" aria-invalid={!!errors.ownerName} />
                    <FieldError errors={errors.ownerName ? [errors.ownerName] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="ownerMobile"
              render={({ field }) => (
                <Field data-invalid={!!errors.ownerMobile}>
                  <FieldContent>
                    <FieldLabel htmlFor="ownerMobile">Owner mobile</FieldLabel>
                    <Input {...field} id="ownerMobile" placeholder="9876543210" aria-invalid={!!errors.ownerMobile} />
                    <FieldError errors={errors.ownerMobile ? [errors.ownerMobile] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="ownerPassword"
              render={({ field }) => (
                <Field data-invalid={!!errors.ownerPassword}>
                  <FieldContent>
                    <FieldLabel htmlFor="ownerPassword">Owner password</FieldLabel>
                    <Input {...field} id="ownerPassword" type="password" aria-invalid={!!errors.ownerPassword} />
                    <FieldError errors={errors.ownerPassword ? [errors.ownerPassword] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending && <Spinner />}
              Create tenant
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
