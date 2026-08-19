// Server-only wrapper for Cloudflare Pages' custom-domains API — lets a
// tenant attach their own domain to their Pages project (named after their
// slug, see app/api/tenants/[tenantId]/deploy-web/route.ts) with Vercel-style
// DNS instructions and live status, no Cloudflare dashboard visit needed.
// Needs CLOUDFLARE_API_TOKEN (Account.Cloudflare Pages: Edit) and
// CLOUDFLARE_ACCOUNT_ID as panel env vars — see .env.example.

const API_BASE = "https://api.cloudflare.com/client/v4";

export class CloudflareError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type PagesDomainStatus = "initializing" | "pending" | "active" | "deactivated" | "blocked" | "error";

export interface PagesDomain {
  id: string;
  name: string;
  status: PagesDomainStatus;
  created_on?: string;
  // method "txt" means Cloudflare needs the txt_name/txt_value record below to prove ownership;
  // "http" means it validates by requesting a token file — either way this only matters pre-"active".
  validation_data?: {
    method?: "http" | "txt";
    status?: string;
    error_message?: string;
    txt_name?: string;
    txt_value?: string;
  };
  verification_data?: { status?: string; error_message?: string };
}

function credentials(): { token: string; accountId: string } | null {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !accountId) return null;
  return { token, accountId };
}

export function cloudflareConfigured(): boolean {
  return credentials() !== null;
}

async function cfFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const creds = credentials();
  if (!creds) {
    throw new CloudflareError("Custom domains aren't configured on this panel yet (missing CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID).", 501);
  }

  const res = await fetch(`${API_BASE}/accounts/${creds.accountId}${path}`, {
    method: options.method ?? "GET",
    headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
    ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    const message = data?.errors?.[0]?.message || `Cloudflare API request failed (${res.status}).`;
    throw new CloudflareError(message, res.status);
  }
  return data.result as T;
}

export function listPagesDomains(projectName: string) {
  return cfFetch<PagesDomain[]>(`/pages/projects/${projectName}/domains`);
}

export function addPagesDomain(projectName: string, domain: string) {
  return cfFetch<PagesDomain>(`/pages/projects/${projectName}/domains`, { method: "POST", body: { name: domain } });
}

export function removePagesDomain(projectName: string, domain: string) {
  return cfFetch<null>(`/pages/projects/${projectName}/domains/${encodeURIComponent(domain)}`, { method: "DELETE" });
}
