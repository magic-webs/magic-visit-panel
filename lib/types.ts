// Domain types mirroring the auth-bridge's response shapes 1:1 (see auth-bridge/src/routes/panel.routes.ts).

import type { Capability, StructuralRole } from "@/lib/capabilities";

export type TenantStatus = "active" | "suspended" | "trial" | "cancelled";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan?: string;
  authEmailDomain: string;
  primaryContactEmail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TenantSummary extends Organization {
  staffCount: number;
  branchCount: number;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  plan?: string;
  primaryContactEmail?: string;
  ownerName: string;
  ownerMobile: string;
  ownerPassword: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  status?: TenantStatus;
  plan?: string;
  primaryContactEmail?: string;
}

export interface ThemeBaseTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  destructive: string;
}

export interface ThemeRow {
  id: string;
  tenantId: string;
  isPreset: boolean;
  presetKey?: string;
  font: string;
  radius: number;
  light: ThemeBaseTokens;
  dark: ThemeBaseTokens;
  updatedAt: number;
}

export interface BrandingRow {
  id: string;
  tenantId: string;
  appName: string;
  shortName?: string;
  logoLightFileId?: string;
  logoDarkFileId?: string;
  iconFileId?: string;
  /** Custom hosting domain for this tenant's web/PWA build, e.g. "app.example.com". */
  customDomain?: string;
  updatedAt: number;
}

export interface TenantConfigInput {
  theme: {
    isPreset: boolean;
    presetKey?: string;
    font: string;
    radius: number;
    light: ThemeBaseTokens;
    dark: ThemeBaseTokens;
  };
  branding: {
    appName: string;
    shortName?: string;
    logoLightFileId?: string;
    logoDarkFileId?: string;
    iconFileId?: string;
    customDomain?: string;
  };
}

export interface RoleRow {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  inheritsScopeFrom: StructuralRole;
  permissions: Capability[];
  isSystem: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRoleInput {
  name: string;
  key: string;
  inheritsScopeFrom: StructuralRole;
  permissions: Capability[];
  cloneFromRoleId?: string;
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: Capability[];
  active?: boolean;
}

export type PanelOperatorRole = "super_admin" | "tenant_admin";

export interface PanelOperator {
  id: string;
  name: string;
  role: PanelOperatorRole;
}
