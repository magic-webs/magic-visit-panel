"use client";

// Typed fetch wrappers hitting the PANEL'S OWN app/api/** Route Handlers —
// never the auth-bridge Worker directly. Mirrors the shape of the mobile
// app's lib/auth-bridge.ts `authedFetch` pattern: throw a typed error on any
// non-2xx response so callers (React Query mutations) get a clean message.
//
// Every call carries the `x-panel-request: 1` header the Route Handlers
// check as a lightweight CSRF guard (see proxy.ts / each route.ts).

import type {
  CreateOrganizationInput,
  CreateRoleInput,
  Organization,
  PanelOperator,
  RoleRow,
  TenantConfigInput,
  TenantSummary,
  ThemeRow,
  BrandingRow,
  UpdateOrganizationInput,
  UpdateRoleInput,
} from "@/lib/types";

export class PanelApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function panelFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-panel-request": "1",
    },
    credentials: "same-origin",
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      message = data?.error ?? message;
    } catch {
      // ignore — keep default message
    }
    throw new PanelApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

// --- Auth -------------------------------------------------------------

export function loginRequest(email: string, password: string) {
  return panelFetch<{ token: string; operator: PanelOperator }>("/api/auth/login", "POST", { email, password });
}

export function createSessionRequest(refreshToken: string, operator: PanelOperator) {
  return panelFetch<{ ok: true; operator: PanelOperator }>("/api/auth/session", "POST", { refreshToken, operator });
}

export function logoutRequest() {
  return panelFetch<{ ok: true }>("/api/auth/logout", "POST");
}

// --- Tenants ------------------------------------------------------------

export function listTenants() {
  return panelFetch<{ organizations: TenantSummary[] }>("/api/tenants");
}

export function createTenant(input: CreateOrganizationInput) {
  return panelFetch<{ id: string; name: string; slug: string }>("/api/tenants", "POST", input);
}

export function getTenant(tenantId: string) {
  return panelFetch<Organization>(`/api/tenants/${tenantId}`);
}

export function updateTenant(tenantId: string, input: UpdateOrganizationInput) {
  return panelFetch<{ id: string }>(`/api/tenants/${tenantId}`, "PATCH", input);
}

// --- Tenant config (theme + branding) ------------------------------------

export function getTenantConfig(tenantId: string) {
  return panelFetch<{ theme: ThemeRow | null; branding: BrandingRow | null }>(`/api/tenants/${tenantId}/config`);
}

export function putTenantConfig(tenantId: string, input: TenantConfigInput) {
  return panelFetch<{ ok: true }>(`/api/tenants/${tenantId}/config`, "PUT", input);
}

// --- Roles ----------------------------------------------------------------

export function listRoles(tenantId: string) {
  return panelFetch<{ roles: RoleRow[] }>(`/api/tenants/${tenantId}/roles`);
}

export function createRole(tenantId: string, input: CreateRoleInput) {
  return panelFetch<{ id: string }>(`/api/tenants/${tenantId}/roles`, "POST", input);
}

export function updateRole(tenantId: string, roleId: string, input: UpdateRoleInput) {
  return panelFetch<{ id: string }>(`/api/tenants/${tenantId}/roles/${roleId}`, "PATCH", input);
}

export function deleteRole(tenantId: string, roleId: string) {
  return panelFetch<{ id: string }>(`/api/tenants/${tenantId}/roles/${roleId}`, "DELETE");
}

// --- Builds -----------------------------------------------------------

export interface TriggerBuildInput {
  tenantSlug: string;
  platform?: "android" | "ios" | "all";
  profile?: "preview" | "production";
}

export function triggerBuild(tenantId: string, input: TriggerBuildInput) {
  return panelFetch<{ ok: true; actionsUrl: string }>(`/api/tenants/${tenantId}/build`, "POST", input);
}

export interface TriggerWebDeployInput {
  tenantSlug: string;
  cloudflareProject?: string;
}

export function triggerWebDeploy(tenantId: string, input: TriggerWebDeployInput) {
  return panelFetch<{ ok: true; actionsUrl: string }>(`/api/tenants/${tenantId}/deploy-web`, "POST", input);
}

export interface RunSummary {
  id: number;
  workflow: string;
  status: string;
  conclusion: string | null;
  htmlUrl: string;
  createdAt: string;
  displayTitle: string;
}

export function getExportRuns(tenantId: string, tenantSlug: string) {
  return panelFetch<{ configured: boolean; runs: RunSummary[]; error?: string }>(
    `/api/tenants/${tenantId}/export/runs?tenantSlug=${encodeURIComponent(tenantSlug)}`,
  );
}
