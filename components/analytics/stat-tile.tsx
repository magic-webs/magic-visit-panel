"use client";

import { Area, AreaChart } from "recharts";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const SPARKLINE_CONFIG: ChartConfig = { value: { label: "Value", color: "var(--chart-1)" } };

export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  sparkline,
}: {
  label: string;
  value: string;
  /** Fractional change, e.g. 0.12 = +12%. Omit when there's no meaningful baseline. */
  delta?: number;
  deltaLabel?: string;
  sparkline?: number[];
}) {
  const data = (sparkline ?? []).map((point, index) => ({ index, value: point }));
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        {delta !== undefined ? (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
            )}
          >
            {isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
            {deltaLabel ?? `${Math.abs(delta * 100).toFixed(1)}%`}
          </span>
        ) : (
          <span />
        )}
        {data.length > 1 && (
          <ChartContainer config={SPARKLINE_CONFIG} className="aspect-auto h-10 w-24">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
