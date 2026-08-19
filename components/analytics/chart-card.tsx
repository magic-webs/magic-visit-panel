"use client";

import * as React from "react";
import { LineChartIcon, TableIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ChartCard({
  title,
  description,
  action,
  chart,
  table,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  chart: React.ReactNode;
  /** Same data as a table — the required a11y fallback for chart marks below 3:1 contrast. */
  table: React.ReactNode;
}) {
  const [view, setView] = React.useState<"chart" | "table">("chart");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <CardAction className="flex items-center gap-1">
            {action}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setView((current) => (current === "chart" ? "table" : "chart"))}
              title={view === "chart" ? "View as table" : "View as chart"}
            >
              {view === "chart" ? <TableIcon /> : <LineChartIcon />}
              <span className="sr-only">Toggle table view</span>
            </Button>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>{view === "chart" ? chart : table}</CardContent>
    </Card>
  );
}
