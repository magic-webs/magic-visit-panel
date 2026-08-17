"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3Icon,
  Building2Icon,
  ChevronsUpDownIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SunIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useOperator } from "@/providers/operator-provider";
import { useTenant } from "@/hooks/use-tenants";
import { useLogout } from "@/hooks/use-logout";

const TENANT_NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/roles", label: "Roles", icon: ShieldCheckIcon },
  { href: "/theme", label: "Theme", icon: PaletteIcon },
  { href: "/branding", label: "Branding", icon: ImageIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams<{ tenantId?: string }>();
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { organization } = useTenant(tenantId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/tenants" />}>
              <Building2Icon className="text-primary" />
              <div className="flex flex-col leading-tight">
                <span className="font-medium">Magic Visit Panel</span>
                <span className="text-xs text-muted-foreground">Multi-tenant console</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/tenants" />} isActive={pathname === "/tenants"} tooltip="Tenants">
                <Building2Icon />
                <span>Tenants</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {tenantId && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="truncate">{organization?.name ?? "This tenant"}</SidebarGroupLabel>
              <SidebarMenu>
                {TENANT_NAV_ITEMS.map((item) => {
                  const href = `/tenants/${tenantId}${item.href}`;
                  const isActive = item.href === "" ? pathname === href : pathname.startsWith(href);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <OperatorMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const icon = theme === "dark" ? <MoonIcon /> : theme === "light" ? <SunIcon /> : <MonitorIcon />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton tooltip="Appearance" />}>
        {icon}
        <span>Appearance</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <MonitorIcon /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OperatorMenu() {
  const operator = useOperator();
  const { logout, isLoggingOut } = useLogout();
  const initials = operator.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col text-left leading-tight">
          <span className="truncate font-medium">{operator.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {operator.role === "super_admin" ? "Super Admin" : "Tenant Admin"}
          </span>
        </div>
        <ChevronsUpDownIcon className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{operator.name}</span>
          <Badge variant="secondary" className="w-fit">
            {operator.role === "super_admin" ? "Super Admin" : "Tenant Admin"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onClick={() => logout()}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
