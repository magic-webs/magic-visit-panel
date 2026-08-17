"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { ThemeScope } from "@/components/theme/theme-scope";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart3Icon, Building2Icon, LayoutDashboardIcon, ShieldCheckIcon } from "lucide-react";
import type { ThemeDraft } from "@/hooks/use-theme-preview";

const SAMPLE_DATA = [
  { day: "Mon", visits: 42 },
  { day: "Tue", visits: 58 },
  { day: "Wed", visits: 51 },
  { day: "Thu", visits: 66 },
  { day: "Fri", visits: 74 },
  { day: "Sat", visits: 88 },
  { day: "Sun", visits: 65 },
];

const CHART_CONFIG: ChartConfig = {
  visits: { label: "Visits", color: "var(--chart-1)" },
};

const STAT_TILES = [
  { label: "Total visits", value: "1,284" },
  { label: "Conversion", value: "24.6%" },
  { label: "Active discounts", value: "7" },
];

export function ThemePreview({
  theme,
  mode,
  appName,
  logoUrl,
}: {
  theme: ThemeDraft;
  mode: "light" | "dark";
  appName: string;
  logoUrl?: string;
}) {
  return (
    <Card className="sticky top-6 overflow-hidden p-0">
      <ThemeScope light={theme.light} dark={theme.dark} radius={theme.radius} font={theme.font} mode={mode} className="bg-background text-foreground">
        <SidebarProvider className="min-h-[540px] w-full" defaultOpen>
          <Sidebar collapsible="none" className="w-52 shrink-0 border-r">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="size-6 rounded object-contain" />
                ) : (
                  <Building2Icon className="size-5 text-primary" />
                )}
                <span className="truncate text-sm font-medium">{appName || "Your App"}</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <LayoutDashboardIcon />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ShieldCheckIcon />
                      <span>Staff</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BarChart3Icon />
                      <span>Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="gap-4 p-4">
            <div className="grid grid-cols-3 gap-3">
              {STAT_TILES.map((tile) => (
                <Card key={tile.label} size="sm">
                  <CardHeader>
                    <CardDescription className="text-xs">{tile.label}</CardDescription>
                    <CardTitle className="text-xl">{tile.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Visits this week</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={CHART_CONFIG} className="aspect-auto h-32 w-full">
                  <AreaChart data={SAMPLE_DATA} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={4} fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Area dataKey="visits" type="monotone" fill="var(--color-visits)" fillOpacity={0.25} stroke="var(--color-visits)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Badge>Active</Badge>
              <Badge variant="secondary">Trial</Badge>
              <Badge variant="destructive">Suspended</Badge>
            </div>

            <Card size="sm" className="overflow-hidden py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Asha Rao</TableCell>
                    <TableCell className="text-muted-foreground">Salesperson</TableCell>
                    <TableCell className="text-right tabular-nums">128</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vikram Shah</TableCell>
                    <TableCell className="text-muted-foreground">Branch Manager</TableCell>
                    <TableCell className="text-right tabular-nums">96</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </SidebarInset>
        </SidebarProvider>
      </ThemeScope>
    </Card>
  );
}
