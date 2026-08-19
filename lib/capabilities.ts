// Mirrors auth-bridge/src/lib/capabilities.ts — kept in sync by hand. Panel only composes roles from this list, never invents new capability strings.

export const CAPABILITIES = [
  "can_manage_staff",
  "can_manage_roles",
  "can_manage_branches",
  "can_manage_customers",
  "can_view_customers",
  "can_manage_visits",
  "can_view_visits",
  "can_record_sales_remarks",
  "can_request_discounts",
  "can_approve_discounts",
  "can_manage_offers",
  "can_manage_performance_ranges",
  "can_manage_salesperson_performance",
  "can_view_analytics",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const STRUCTURAL_ROLES = ["owner", "branch_manager", "receptionist", "salesperson", "accountant"] as const;

export type StructuralRole = (typeof STRUCTURAL_ROLES)[number];

export const STRUCTURAL_ROLE_LABELS: Record<StructuralRole, string> = {
  owner: "Owner",
  branch_manager: "Branch Manager",
  receptionist: "Receptionist",
  salesperson: "Salesperson",
  accountant: "Accountant",
};

// Grouped by resource area (not CRUD) for the permission-editor UI, since capabilities don't map onto uniform CRUD slots.
export interface CapabilityGroup {
  key: string;
  label: string;
  description: string;
  capabilities: Capability[];
}

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    key: "visitor_logs",
    label: "Visitor Logs",
    description: "Recording and managing walk-in visits and their outcomes.",
    capabilities: ["can_view_visits", "can_manage_visits", "can_record_sales_remarks"],
  },
  {
    key: "customers",
    label: "Customers",
    description: "The tenant's customer directory.",
    capabilities: ["can_view_customers", "can_manage_customers"],
  },
  {
    key: "staff",
    label: "Staff & Roles",
    description: "Managing staff accounts and the roles they can be assigned.",
    capabilities: ["can_manage_staff", "can_manage_roles"],
  },
  {
    key: "branches",
    label: "Branches",
    description: "Creating and editing branch locations.",
    capabilities: ["can_manage_branches"],
  },
  {
    key: "discounts",
    label: "Discounts",
    description: "Requesting and authorizing discount requests.",
    capabilities: ["can_request_discounts", "can_approve_discounts"],
  },
  {
    key: "offers",
    label: "Offers",
    description: "The tenant's promotional offers catalog.",
    capabilities: ["can_manage_offers"],
  },
  {
    key: "performance",
    label: "Performance",
    description: "Salesperson scoring bands and point awards.",
    capabilities: ["can_manage_performance_ranges", "can_manage_salesperson_performance"],
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Dashboards and reporting.",
    capabilities: ["can_view_analytics"],
  },
];

export const CAPABILITY_LABELS: Record<Capability, string> = {
  can_manage_staff: "Manage staff",
  can_manage_roles: "Manage roles",
  can_manage_branches: "Manage branches",
  can_manage_customers: "Manage customers",
  can_view_customers: "View customers",
  can_manage_visits: "Manage visits",
  can_view_visits: "View visits",
  can_record_sales_remarks: "Record sales remarks",
  can_request_discounts: "Request discounts",
  can_approve_discounts: "Approve discounts",
  can_manage_offers: "Manage offers",
  can_manage_performance_ranges: "Manage performance ranges",
  can_manage_salesperson_performance: "Award performance points",
  can_view_analytics: "View analytics",
};
