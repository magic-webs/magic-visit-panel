// Mirrors the subset of c:\development\magic-visit-crm\magic-visit-app\instant.schema.ts
// that this panel actually reads. This is a separate package/deploy from the
// mobile app and cannot import across the repo boundary, so this file must be
// kept in sync BY HAND whenever the source schema changes shape for any of
// the entities/links below. Do not add fields the bridge doesn't return, and
// do not rely on this file for anything the bridge doesn't already expose —
// it exists only so `db.useQuery` has types for the realtime reads this panel
// performs directly against InstantDB (see instant.perms.ts in the mobile
// app repo for why panel operators are allowed to read these namespaces).
//
// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),

    organizations: i.entity({
      name: i.string(),
      slug: i.string().unique().indexed(),
      status: i.string().indexed(), // active | suspended | trial | cancelled
      plan: i.string().indexed().optional(),
      authEmailDomain: i.string().indexed(),
      primaryContactEmail: i.string().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    panelOperators: i.entity({
      name: i.string(),
      email: i.string().unique().indexed(),
      role: i.string().indexed(), // super_admin | tenant_admin
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
    }),

    roles: i.entity({
      tenantId: i.string().indexed(),
      key: i.string().indexed(),
      name: i.string(),
      inheritsScopeFrom: i.string().indexed(),
      permissions: i.json(), // string[] of capability keys
      isSystem: i.boolean().indexed(),
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    // Editable base tokens live in `light`/`dark`; every other shadcn CSS
    // variable is derived from these at read time by lib/theme/derive-theme.ts
    // — never stored redundantly here.
    themes: i.entity({
      tenantId: i.string().unique().indexed(),
      isPreset: i.boolean(),
      presetKey: i.string().optional(),
      font: i.string(),
      radius: i.number(),
      light: i.json(), // ThemeBaseTokens
      dark: i.json(), // ThemeBaseTokens
      updatedAt: i.date(),
    }),

    branding: i.entity({
      tenantId: i.string().unique().indexed(),
      appName: i.string(),
      shortName: i.string().optional(),
      logoLightFileId: i.string().optional(),
      logoDarkFileId: i.string().optional(),
      iconFileId: i.string().optional(),
      customDomain: i.string().optional(),
      updatedAt: i.date(),
    }),

    profiles: i.entity({
      name: i.string(),
      mobile: i.string().indexed(),
      email: i.string().optional(),
      role: i.string().indexed(),
      roleId: i.string().indexed(),
      active: i.boolean().indexed(),
      employeeId: i.string().indexed().optional(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    branches: i.entity({
      name: i.string(),
      location: i.string(),
      phone: i.string().optional(),
      active: i.boolean().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
    }),

    customers: i.entity({
      name: i.string(),
      mobile: i.string().indexed(),
      isPrimeMember: i.boolean().indexed().optional(),
      tenantId: i.string().indexed(),
    }),

    visitorLogs: i.entity({
      status: i.string().indexed(),
      assignmentStatus: i.string().indexed(),
      serialNumber: i.number().indexed(),
      visitedAt: i.date().indexed(),
      followUpDate: i.string().optional().indexed(),
      purpose: i.string().optional(),
      tenantId: i.string().indexed(),
    }),

    discountRequests: i.entity({
      discountType: i.string(),
      discountValue: i.number(),
      status: i.string().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      appliedAt: i.date().optional().indexed(),
    }),

    salespersonPerformance: i.entity({
      points: i.number(),
      month: i.string().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),
  },
  rooms: {},
  links: {
    panelOperatorsUser: {
      forward: { on: "panelOperators", has: "one", label: "$user" },
      reverse: { on: "$users", has: "one", label: "panelOperator" },
    },
    panelOperatorOrganizations: {
      forward: { on: "panelOperators", has: "many", label: "organizations" },
      reverse: { on: "organizations", has: "many", label: "panelOperators" },
    },
    visitorLogsBranch: {
      forward: { on: "visitorLogs", has: "one", label: "branch" },
      reverse: { on: "branches", has: "many", label: "visitorLogs" },
    },
    visitorLogsSalesperson: {
      forward: { on: "visitorLogs", has: "one", label: "salesperson" },
      reverse: { on: "profiles", has: "many", label: "salespersonLogs" },
    },
    discountRequestsVisitorLog: {
      forward: { on: "discountRequests", has: "one", label: "visitorLog", onDelete: "cascade" },
      reverse: { on: "visitorLogs", has: "many", label: "discountRequests" },
    },
    performanceSalesperson: {
      forward: { on: "salespersonPerformance", has: "one", label: "salesperson", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "performanceEntries" },
    },
  },
});

type _AppSchema = typeof _schema;
// Mirrors the mobile app's instant.schema.ts verbatim (see the module
// comment above) — the empty-interface indirection is what gives nicer
// IntelliSense on `db`.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
