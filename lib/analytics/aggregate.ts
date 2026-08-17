// Client-side aggregation for the analytics dashboards. InstantDB has no
// server-side GROUP BY, so every chart's hook (hooks/use-analytics-data.ts)
// runs a live db.useQuery for the raw rows and reduces them here, memoized
// by the caller.
import { STATUS_STYLES, type VisitorStatus, type DiscountRequestStatus } from "@/lib/analytics/status-colors";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface VisitorLogRecord {
  id: string;
  status: string;
  visitedAt: number;
  branchId?: string;
  branchName?: string;
  salespersonId?: string;
  salespersonName?: string;
}

export interface DiscountRequestRecord {
  id: string;
  status: string;
  createdAt: number;
  appliedAt?: number;
}

export interface SalespersonPerformanceRecord {
  salespersonId?: string;
  salespersonName?: string;
  points: number;
  month: string;
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eachDay(range: DateRange): string[] {
  const days: string[] = [];
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
  while (cursor.getTime() <= end.getTime()) {
    days.push(dayKey(cursor.getTime()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function filterByRange<T extends { visitedAt?: number; createdAt?: number }>(records: T[], range: DateRange): T[] {
  const fromMs = range.from.getTime();
  const toMs = range.to.getTime();
  return records.filter((record) => {
    const ts = record.visitedAt ?? record.createdAt ?? 0;
    return ts >= fromMs && ts <= toMs;
  });
}

// --- Visits over time -------------------------------------------------

export interface VisitsOverTimePoint {
  date: string;
  total: number;
  [branchName: string]: string | number;
}

// Categorical hues are a fixed, never-cycled set (see chart-palette-bank.ts)
// — a breakdown series can't just grow one column per branch, so this caps
// the breakdown to the top N branches by volume; any visit at a smaller
// branch still counts toward `total`, just not toward its own column.
export function topBranchNames(records: VisitorLogRecord[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (!record.branchName) continue;
    counts.set(record.branchName, (counts.get(record.branchName) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export function visitsOverTime(records: VisitorLogRecord[], range: DateRange, byBranch: boolean): VisitsOverTimePoint[] {
  const days = eachDay(range);
  const branchNames = byBranch ? topBranchNames(records, 5) : [];

  const buckets = new Map<string, VisitsOverTimePoint>();
  for (const day of days) {
    const point: VisitsOverTimePoint = { date: day, total: 0 };
    for (const name of branchNames) point[name] = 0;
    buckets.set(day, point);
  }

  for (const record of records) {
    const key = dayKey(record.visitedAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (byBranch && record.branchName && branchNames.includes(record.branchName)) {
      bucket[record.branchName] = (Number(bucket[record.branchName]) || 0) + 1;
    }
  }

  return days.map((day) => buckets.get(day)!);
}

// --- Conversion funnel --------------------------------------------------

const STATUS_ORDER: VisitorStatus[] = ["window_shopping", "follow_up", "not_available", "not_interested", "sold"];

export interface FunnelBucket {
  status: VisitorStatus;
  label: string;
  color: string;
  count: number;
}

export function conversionFunnel(records: VisitorLogRecord[]): FunnelBucket[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.status, (counts.get(record.status) ?? 0) + 1);
  }
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_STYLES[status].label,
    color: STATUS_STYLES[status].color,
    count: counts.get(status) ?? 0,
  }));
}

export function conversionRate(records: VisitorLogRecord[]): number {
  if (records.length === 0) return 0;
  const sold = records.filter((r) => r.status === "sold").length;
  return sold / records.length;
}

// --- Branch comparison ---------------------------------------------------

export interface BranchComparisonRow {
  branchId: string;
  branchName: string;
  count: number;
}

export function branchComparison(records: VisitorLogRecord[]): BranchComparisonRow[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const record of records) {
    if (!record.branchId) continue;
    const existing = counts.get(record.branchId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(record.branchId, { name: record.branchName ?? "Unknown branch", count: 1 });
    }
  }
  return Array.from(counts.entries())
    .map(([branchId, value]) => ({ branchId, branchName: value.name, count: value.count }))
    .sort((a, b) => b.count - a.count);
}

// --- Salesperson leaderboard -----------------------------------------------

export interface SalespersonLeaderboardRow {
  salespersonId: string;
  salespersonName: string;
  totalVisits: number;
  soldCount: number;
  conversionRate: number;
  points: number;
}

export function salespersonLeaderboard(
  visitorLogs: VisitorLogRecord[],
  performance: SalespersonPerformanceRecord[],
): SalespersonLeaderboardRow[] {
  const rows = new Map<string, SalespersonLeaderboardRow>();

  for (const log of visitorLogs) {
    if (!log.salespersonId) continue;
    const existing = rows.get(log.salespersonId) ?? {
      salespersonId: log.salespersonId,
      salespersonName: log.salespersonName ?? "Unassigned",
      totalVisits: 0,
      soldCount: 0,
      conversionRate: 0,
      points: 0,
    };
    existing.totalVisits += 1;
    if (log.status === "sold") existing.soldCount += 1;
    rows.set(log.salespersonId, existing);
  }

  for (const entry of performance) {
    if (!entry.salespersonId) continue;
    const existing = rows.get(entry.salespersonId);
    if (existing) {
      existing.points += entry.points;
    } else {
      rows.set(entry.salespersonId, {
        salespersonId: entry.salespersonId,
        salespersonName: entry.salespersonName ?? "Unassigned",
        totalVisits: 0,
        soldCount: 0,
        conversionRate: 0,
        points: entry.points,
      });
    }
  }

  const result = Array.from(rows.values()).map((row) => ({
    ...row,
    conversionRate: row.totalVisits > 0 ? row.soldCount / row.totalVisits : 0,
  }));

  return result.sort((a, b) => b.totalVisits - a.totalVisits);
}

// --- Discount approval throughput ------------------------------------------

const DISCOUNT_STATUS_ORDER: DiscountRequestStatus[] = ["pending_otp", "applied", "cancelled", "locked"];

export interface DiscountThroughputPoint {
  date: string;
  [status: string]: string | number;
}

export function discountThroughputOverTime(records: DiscountRequestRecord[], range: DateRange): DiscountThroughputPoint[] {
  const days = eachDay(range);
  const buckets = new Map<string, DiscountThroughputPoint>();
  for (const day of days) {
    const point: DiscountThroughputPoint = { date: day };
    for (const status of DISCOUNT_STATUS_ORDER) point[status] = 0;
    buckets.set(day, point);
  }

  for (const record of records) {
    const key = dayKey(record.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket[record.status] = (Number(bucket[record.status]) || 0) + 1;
  }

  return days.map((day) => buckets.get(day)!);
}

export function medianResolutionMinutes(records: DiscountRequestRecord[]): number | null {
  const resolved = records
    .filter((r) => r.status === "applied" && r.appliedAt !== undefined)
    .map((r) => (r.appliedAt! - r.createdAt) / 60_000)
    .filter((minutes) => minutes >= 0)
    .sort((a, b) => a - b);

  if (resolved.length === 0) return null;
  const mid = Math.floor(resolved.length / 2);
  return resolved.length % 2 === 0 ? (resolved[mid - 1] + resolved[mid]) / 2 : resolved[mid];
}

export function activeDiscountRequestCount(records: DiscountRequestRecord[]): number {
  return records.filter((r) => r.status === "pending_otp").length;
}

// --- KPI sparklines --------------------------------------------------------

export function dailyCountSparkline(records: Array<{ visitedAt?: number; createdAt?: number }>, days: number): number[] {
  const now = new Date();
  const range: DateRange = { from: new Date(now.getTime() - (days - 1) * 86_400_000), to: now };
  const keys = eachDay(range);
  const counts = new Map<string, number>(keys.map((key) => [key, 0]));
  for (const record of records) {
    const ts = record.visitedAt ?? record.createdAt;
    if (ts === undefined) continue;
    const key = dayKey(ts);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return keys.map((key) => counts.get(key) ?? 0);
}

export const DATE_RANGE_PRESETS = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
] as const;

export function presetToRange(days: number): DateRange {
  const now = new Date();
  const to = now;
  const from = new Date(now.getTime() - (days - 1) * 86_400_000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function monthToDateRange(): DateRange {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from, to: now };
}
