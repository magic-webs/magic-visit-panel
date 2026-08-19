"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { db } from "@/lib/instant";
import { createSessionRequest, loginRequest, PanelApiError } from "@/lib/auth-bridge-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { TriangleAlertIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      // Server-to-server login against the auth-bridge; returns a one-time InstantDB sign-in token.
      const { token, operator } = await loginRequest(values.email, values.password);

      // Exchange it for a live InstantDB session — used app-wide for realtime reads (instant.perms.ts scopes reads, blocks writes).
      await db.auth.signInWithToken(token);
      const auth = await db.getAuth();
      const refreshToken = auth?.refresh_token;
      if (!refreshToken) {
        throw new Error("Could not establish a session. Please try again.");
      }

      // Server stores the refresh token as the httpOnly session cookie; browser JS never touches it again.
      await createSessionRequest(refreshToken, operator);

      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/tenants");
      router.refresh();
    } catch (err) {
      const message = err instanceof PanelApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Magic Visit Panel</CardTitle>
          <CardDescription>Sign in with your operator account to manage tenants.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            {formError && (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>Sign-in failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldContent>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      disabled={isSubmitting}
                    />
                    <FieldError errors={errors.email ? [errors.email] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Field data-invalid={!!errors.password}>
                  <FieldContent>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      disabled={isSubmitting}
                    />
                    <FieldError errors={errors.password ? [errors.password] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting && <Spinner />}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
