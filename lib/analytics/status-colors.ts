// Copied verbatim from
// c:\development\magic-visit-crm\magic-visit-app\constants\theme.ts
// (STATUS_STYLES / DISCOUNT_STATUS_STYLES only — the rest of that file is
// mobile-app-specific navigation theming this panel has no use for).
//
// These are NEVER themed: visit-outcome and discount-status colors must stay
// consistent across the mobile app and this panel regardless of a tenant's
// brand theme, the same way the dataviz skill treats "status" as a small
// fixed scale with reserved meaning, distinct from any themed/categorical
// palette.

export type VisitorStatus = "sold" | "not_interested" | "not_available" | "window_shopping" | "follow_up" | "none";

export const STATUS_STYLES: Record<VisitorStatus, { color: string; label: string }> = {
  sold: { color: "#22c55e", label: "Sold" },
  not_interested: { color: "#ef4444", label: "Not Interested" },
  not_available: { color: "#f59e0b", label: "Not Available" },
  window_shopping: { color: "#3b82f6", label: "Window Shopping" },
  follow_up: { color: "#8b5cf6", label: "Follow Up" },
  none: { color: "#9ca3af", label: "—" },
};

export type DiscountRequestStatus = "pending_otp" | "applied" | "cancelled" | "locked";

export const DISCOUNT_STATUS_STYLES: Record<DiscountRequestStatus, { color: string; label: string }> = {
  pending_otp: { color: "#f59e0b", label: "Awaiting code" },
  applied: { color: "#22c55e", label: "Applied" },
  cancelled: { color: "#9ca3af", label: "Cancelled" },
  locked: { color: "#ef4444", label: "Locked" },
};
