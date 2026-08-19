"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/analytics/chart-card";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { StatTile } from "@/components/analytics/stat-tile";
import {
  useAnalyticsKpis,
  useBranchComparison,
  useConversionFunnel,
  useDiscountThroughput,
  useSalespersonLeaderboard,
  useVisitsOverTime,
} from "@/hooks/use-analytics-data";
import { presetToRange, type DateRange } from "@/lib/analytics/aggregate";
import { DISCOUNT_STATUS_STYLES } from "@/lib/analytics/status-colors";

const CHART_COLOR_VARS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default function AnalyticsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = React.use(params);
  const [range, setRange] = React.useState<DateRange>(() => presetToRange(30));
  const [byBranch, setByBranch] = React.useState(false);

  const { kpis, isLoading: kpisLoading } = useAnalyticsKpis(tenantId, range);
  const { points: visitPoints, branchNames, isLoading: visitsLoading } = useVisitsOverTime(tenantId, range, byBranch);
  const { buckets: funnelBuckets, isLoading: funnelLoading } = useConversionFunnel(tenantId, range);
  const { rows: branchRows, isLoading: branchLoading } = useBranchComparison(tenantId, range);
  const { rows: leaderboardRows, isLoading: leaderboardLoading } = useSalespersonLeaderboard(tenantId, range);
  const { points: discountPoints, medianMinutes, isLoading: discountLoading } = useDiscountThroughput(tenantId, range);

  const visitsConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = { total: { label: "Total visits", color: "var(--chart-1)" } };
    branchNames.forEach((name, index) => {
      config[name] = { label: name, color: CHART_COLOR_VARS[index] ?? CHART_COLOR_VARS[0] };
    });
    return config;
  }, [branchNames]);

  const funnelConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    for (const bucket of funnelBuckets) {
      config[bucket.status] = { label: bucket.label, color: bucket.color };
    }
    return config;
  }, [funnelBuckets]);

  const branchConfig: ChartConfig = { count: { label: "Visits", color: "var(--chart-1)" } };

  const discountConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    for (const [status, style] of Object.entries(DISCOUNT_STATUS_STYLES)) {
      config[status] = { label: style.label, color: style.color };
    }
    return config;
  }, []);

  const maxLeaderboardVisits = Math.max(1, ...leaderboardRows.map((row) => row.totalVisits));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Visit and discount activity for this tenant.</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)
        ) : (
          <>
            <StatTile label="Total visits" value={kpis.totalVisits.toLocaleString()} sparkline={kpis.totalVisitsSparkline} />
            <StatTile
              label="Conversion rate"
              value={`${(kpis.conversionRate * 100).toFixed(1)}%`}
              sparkline={kpis.conversionRateSparkline}
            />
            <StatTile
              label="Active discount requests"
              value={kpis.activeDiscountRequests.toLocaleString()}
              sparkline={kpis.activeDiscountRequestsSparkline}
            />
            <StatTile label="Avg. discount turnaround" value={formatMinutes(kpis.avgDiscountTurnaroundMinutes)} />
          </>
        )}
      </div>

      <ChartCard
        title="Visits over time"
        description="Daily visit volume across the selected range."
        action={
          <ToggleGroup
            variant="outline"
            size="sm"
            value={byBranch ? ["branch"] : ["total"]}
            onValueChange={(value) => setByBranch(value[0] === "branch")}
          >
            <ToggleGroupItem value="total">Total</ToggleGroupItem>
            <ToggleGroupItem value="branch">By branch</ToggleGroupItem>
          </ToggleGroup>
        }
        chart={
          visitsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChartContainer config={visitsConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={visitPoints} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {byBranch ? (
                  branchNames.map((name, index) => (
                    <Area
                      key={name}
                      dataKey={name}
                      type="monotone"
                      stackId="branches"
                      stroke={CHART_COLOR_VARS[index] ?? CHART_COLOR_VARS[0]}
                      fill={CHART_COLOR_VARS[index] ?? CHART_COLOR_VARS[0]}
                      fillOpacity={0.3}
                    />
                  ))
                ) : (
                  <Area dataKey="total" type="monotone" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.25} />
                )}
              </AreaChart>
            </ChartContainer>
          )
        }
        table={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {byBranch && branchNames.map((name) => <TableHead key={name} className="text-right">{name}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitPoints.map((point) => (
                <TableRow key={point.date}>
                  <TableCell>{point.date}</TableCell>
                  <TableCell className="text-right tabular-nums">{point.total}</TableCell>
                  {byBranch && branchNames.map((name) => (
                    <TableCell key={name} className="text-right tabular-nums">{point[name] ?? 0}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion funnel — fixed status palette, never themed */}
        <ChartCard
          title="Conversion funnel"
          description="Visitor outcomes for the selected range."
          chart={
            funnelLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={funnelConfig} className="aspect-auto h-64 w-full">
                <BarChart data={funnelBuckets} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={110} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {funnelBuckets.map((bucket) => (
                      <Cell key={bucket.status} fill={bucket.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )
          }
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funnelBuckets.map((bucket) => (
                  <TableRow key={bucket.status}>
                    <TableCell>{bucket.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{bucket.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        />

        {/* Branch comparison — single sequential hue, since each bar is the same nominal series */}
        <ChartCard
          title="Branch comparison"
          description="Total visits per branch."
          chart={
            branchLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={branchConfig} className="aspect-auto h-64 w-full">
                <BarChart data={branchRows} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="branchName" tickLine={false} axisLine={false} width={110} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            )
          }
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchRows.map((row) => (
                  <TableRow key={row.branchId}>
                    <TableCell>{row.branchName}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        />
      </div>

      {/* Salesperson leaderboard — a Table with a lightweight CSS-width micro-bar per row, not a mounted chart */}
      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Salesperson leaderboard</h3>
          <p className="text-xs text-muted-foreground">Ranked by total visits in the selected range.</p>
        </div>
        {leaderboardLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead className="w-1/3">Volume</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardRows.map((row) => (
                <TableRow key={row.salespersonId}>
                  <TableCell className="font-medium">{row.salespersonName}</TableCell>
                  <TableCell>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/15">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row.totalVisits / maxLeaderboardVisits) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.totalVisits}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.soldCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{(row.conversionRate * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{row.points}</TableCell>
                </TableRow>
              ))}
              {leaderboardRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No salesperson activity in this range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Discount approval throughput — fixed discount-status palette, never themed */}
      <ChartCard
        title="Discount approval throughput"
        description={`Median time to resolution: ${formatMinutes(medianMinutes)}`}
        chart={
          discountLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChartContainer config={discountConfig} className="aspect-auto h-64 w-full">
              <BarChart data={discountPoints} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Object.entries(DISCOUNT_STATUS_STYLES).map(([status, style]) => (
                  <Bar key={status} dataKey={status} stackId="discounts" fill={style.color} radius={2} />
                ))}
              </BarChart>
            </ChartContainer>
          )
        }
        table={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {Object.values(DISCOUNT_STATUS_STYLES).map((style) => (
                  <TableHead key={style.label} className="text-right">
                    {style.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountPoints.map((point) => (
                <TableRow key={point.date}>
                  <TableCell>{point.date}</TableCell>
                  {Object.keys(DISCOUNT_STATUS_STYLES).map((status) => (
                    <TableCell key={status} className="text-right tabular-nums">
                      {point[status] ?? 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      />
    </div>
  );
}
