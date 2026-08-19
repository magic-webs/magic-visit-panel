"use client";

import * as React from "react";
import { db } from "@/lib/instant";
import {
  branchComparison,
  conversionFunnel,
  conversionRate,
  dailyCountSparkline,
  discountThroughputOverTime,
  medianResolutionMinutes,
  activeDiscountRequestCount,
  salespersonLeaderboard,
  topBranchNames,
  visitsOverTime,
  type DateRange,
  type DiscountRequestRecord,
  type SalespersonPerformanceRecord,
  type VisitorLogRecord,
} from "@/lib/analytics/aggregate";

// Shared live query per tenant+range — InstantDB has no server-side GROUP BY,
// so reduction happens client-side; sharing avoids duplicate subscriptions.
function useTenantAnalyticsSource(tenantId: string, range: DateRange) {
  const fromMs = range.from.getTime();
  const toMs = range.to.getTime();

  const { data, isLoading, error } = db.useQuery({
    visitorLogs: {
      $: {
        where: {
          tenantId,
          and: [{ visitedAt: { $gte: new Date(fromMs) } }, { visitedAt: { $lte: new Date(toMs) } }],
        },
      },
      branch: {},
      salesperson: {},
    },
    discountRequests: {
      $: {
        where: {
          tenantId,
          and: [{ createdAt: { $gte: new Date(fromMs) } }, { createdAt: { $lte: new Date(toMs) } }],
        },
      },
    },
    salespersonPerformance: {
      $: { where: { tenantId } },
      salesperson: {},
    },
  });

  const visitorLogs: VisitorLogRecord[] = React.useMemo(
    () =>
      (data?.visitorLogs ?? []).map((log) => ({
        id: log.id,
        status: log.status,
        // i.date() fields resolve as string | number without useDateObjects — normalize to a ms timestamp.
        visitedAt: Number(log.visitedAt),
        branchId: log.branch?.id,
        branchName: log.branch?.name,
        salespersonId: log.salesperson?.id,
        salespersonName: log.salesperson?.name,
      })),
    [data?.visitorLogs],
  );

  const discountRequests: DiscountRequestRecord[] = React.useMemo(
    () =>
      (data?.discountRequests ?? []).map((request) => ({
        id: request.id,
        status: request.status,
        createdAt: Number(request.createdAt),
        appliedAt: request.appliedAt !== undefined ? Number(request.appliedAt) : undefined,
      })),
    [data?.discountRequests],
  );

  const performance: SalespersonPerformanceRecord[] = React.useMemo(
    () =>
      (data?.salespersonPerformance ?? []).map((entry) => ({
        salespersonId: entry.salesperson?.id,
        salespersonName: entry.salesperson?.name,
        points: entry.points,
        month: entry.month,
      })),
    [data?.salespersonPerformance],
  );

  return { visitorLogs, discountRequests, performance, isLoading, error };
}

export function useVisitsOverTime(tenantId: string, range: DateRange, byBranch: boolean) {
  const { visitorLogs, isLoading, error } = useTenantAnalyticsSource(tenantId, range);
  const points = React.useMemo(() => visitsOverTime(visitorLogs, range, byBranch), [visitorLogs, range, byBranch]);
  const branchNames = React.useMemo(() => topBranchNames(visitorLogs, 5), [visitorLogs]);
  return { points, branchNames, isLoading, error };
}

export function useConversionFunnel(tenantId: string, range: DateRange) {
  const { visitorLogs, isLoading, error } = useTenantAnalyticsSource(tenantId, range);
  const buckets = React.useMemo(() => conversionFunnel(visitorLogs), [visitorLogs]);
  return { buckets, isLoading, error };
}

export function useBranchComparison(tenantId: string, range: DateRange) {
  const { visitorLogs, isLoading, error } = useTenantAnalyticsSource(tenantId, range);
  const rows = React.useMemo(() => branchComparison(visitorLogs), [visitorLogs]);
  return { rows, isLoading, error };
}

export function useSalespersonLeaderboard(tenantId: string, range: DateRange) {
  const { visitorLogs, performance, isLoading, error } = useTenantAnalyticsSource(tenantId, range);
  const rows = React.useMemo(() => salespersonLeaderboard(visitorLogs, performance), [visitorLogs, performance]);
  return { rows, isLoading, error };
}

export function useDiscountThroughput(tenantId: string, range: DateRange) {
  const { discountRequests, isLoading, error } = useTenantAnalyticsSource(tenantId, range);
  const points = React.useMemo(() => discountThroughputOverTime(discountRequests, range), [discountRequests, range]);
  const medianMinutes = React.useMemo(() => medianResolutionMinutes(discountRequests), [discountRequests]);
  return { points, medianMinutes, isLoading, error };
}

export interface AnalyticsKpis {
  totalVisits: number;
  totalVisitsSparkline: number[];
  conversionRate: number;
  conversionRateSparkline: number[];
  activeDiscountRequests: number;
  activeDiscountRequestsSparkline: number[];
  avgDiscountTurnaroundMinutes: number | null;
}

export function useAnalyticsKpis(tenantId: string, range: DateRange) {
  const { visitorLogs, discountRequests, isLoading, error } = useTenantAnalyticsSource(tenantId, range);

  const kpis: AnalyticsKpis = React.useMemo(() => {
    const sparklineDays = 14;
    const soldLogs = visitorLogs.filter((log) => log.status === "sold");
    const conversionSparkline = dailyCountSparkline(soldLogs, sparklineDays);
    const totalSparkline = dailyCountSparkline(visitorLogs, sparklineDays);
    const resolved = discountRequests.filter((r) => r.status === "applied" && r.appliedAt !== undefined);
    const avgTurnaround =
      resolved.length > 0
        ? resolved.reduce((sum, r) => sum + (r.appliedAt! - r.createdAt) / 60_000, 0) / resolved.length
        : null;

    return {
      totalVisits: visitorLogs.length,
      totalVisitsSparkline: totalSparkline,
      conversionRate: conversionRate(visitorLogs),
      conversionRateSparkline: conversionSparkline,
      activeDiscountRequests: activeDiscountRequestCount(discountRequests),
      activeDiscountRequestsSparkline: dailyCountSparkline(
        discountRequests.filter((r) => r.status === "pending_otp"),
        sparklineDays,
      ),
      avgDiscountTurnaroundMinutes: avgTurnaround,
    };
  }, [visitorLogs, discountRequests]);

  return { kpis, isLoading, error };
}
