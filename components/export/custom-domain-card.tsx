"use client";

import * as React from "react";
import { Globe, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddTenantDomain, useRemoveTenantDomain, useTenantDomains } from "@/hooks/use-tenant-domain";
import type { PagesDomainSummary } from "@/lib/auth-bridge-client";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  initializing: "secondary",
  error: "destructive",
  blocked: "destructive",
  deactivated: "outline",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  active: CheckCircle2,
  error: AlertTriangle,
  blocked: AlertTriangle,
};

// Attaches a tenant's own domain to their Cloudflare Pages project (Vercel's
// "Add domain" flow, same underlying idea) — Cloudflare handles DNS
// validation and SSL automatically once the CNAME below resolves.
export function CustomDomainCard({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [domainInput, setDomainInput] = React.useState("");
  const { data, isLoading } = useTenantDomains(tenantId);
  const addDomain = useAddTenantDomain(tenantId);
  const removeDomain = useRemoveTenantDomain(tenantId);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const domain = domainInput.trim().toLowerCase();
    if (!domain) return;
    addDomain.mutate(domain, { onSuccess: () => setDomainInput("") });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-4" />
          Custom domain
        </CardTitle>
        <CardDescription>
          Point your own domain at this tenant&apos;s deployed web/PWA — Cloudflare provisions DNS validation and SSL
          automatically, same as adding a domain on Vercel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data && !data.configured && (
          <Alert variant="destructive">
            <AlertDescription>
              Custom domains aren&apos;t set up yet — this panel needs <code>CLOUDFLARE_API_TOKEN</code> (Cloudflare
              Pages: Edit permission) and <code>CLOUDFLARE_ACCOUNT_ID</code> set in its environment.
            </AlertDescription>
          </Alert>
        )}

        {data?.configured && (
          <>
            {data.domains.length > 0 && (
              <ul className="flex flex-col gap-3">
                {data.domains.map((d) => (
                  <DomainRow
                    key={d.id}
                    domain={d}
                    tenantSlug={tenantSlug}
                    onRemove={() => removeDomain.mutate(d.name)}
                    removing={removeDomain.isPending && removeDomain.variables === d.name}
                  />
                ))}
              </ul>
            )}

            <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
              <Input
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="app.example.com"
                className="max-w-64"
                disabled={addDomain.isPending}
              />
              <Button type="submit" size="sm" disabled={!domainInput.trim() || addDomain.isPending}>
                {addDomain.isPending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                Add domain
              </Button>
            </form>

            {addDomain.isError && (
              <Alert variant="destructive">
                <AlertDescription>{addDomain.error.message}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Subdomains only (e.g. <code>app.example.com</code>) — an apex/root domain (<code>example.com</code>)
              needs its nameservers pointed at Cloudflare, not just a CNAME, so add those from a Cloudflare-managed
              zone instead.
            </p>
          </>
        )}

        {isLoading && <Spinner className="size-4" />}
      </CardContent>
    </Card>
  );
}

function DomainRow({
  domain,
  tenantSlug,
  onRemove,
  removing,
}: {
  domain: PagesDomainSummary;
  tenantSlug: string;
  onRemove: () => void;
  removing: boolean;
}) {
  const Icon = STATUS_ICON[domain.status] ?? Clock;
  const needsTxt = domain.validation_data?.method === "txt" && domain.status !== "active";

  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-sm">{domain.name}</span>
          <Badge variant={STATUS_VARIANT[domain.status] ?? "outline"} className="gap-1">
            <Icon className="size-3" />
            {domain.status}
          </Badge>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onRemove} disabled={removing} aria-label="Remove domain">
          {removing ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
        </Button>
      </div>

      {domain.status !== "active" && (
        <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
          <p>Add this DNS record at your domain&apos;s provider:</p>
          <code className="mt-1 block rounded bg-background px-2 py-1">
            CNAME {domain.name} → {tenantSlug}.pages.dev
          </code>
          {needsTxt && domain.validation_data?.txt_name && (
            <>
              <p className="mt-2">Then a TXT record to prove ownership:</p>
              <code className="mt-1 block rounded bg-background px-2 py-1 break-all">
                TXT {domain.validation_data.txt_name} → {domain.validation_data.txt_value}
              </code>
            </>
          )}
        </div>
      )}

      {(domain.validation_data?.error_message || domain.verification_data?.error_message) && (
        <p className="text-xs text-destructive">
          {domain.validation_data?.error_message || domain.verification_data?.error_message}
        </p>
      )}
    </li>
  );
}
