"use client";

import * as React from "react";
import {
  Phone,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  LogOut,
  Calendar,
  Gem,
  LayoutGrid,
  Users,
  UserCircle2,
} from "lucide-react";
import { deriveMobileBrand } from "@/lib/theme/derive-brand-vars";
import { cn } from "@/lib/utils";
import type { ThemeDraft } from "@/hooks/use-theme-preview";

type Screen = "login" | "dashboard" | "profile";

const SCREENS: Array<{ key: Screen; label: string }> = [
  { key: "login", label: "Auth" },
  { key: "dashboard", label: "Dashboard" },
  { key: "profile", label: "Profile" },
];

// Mirrors the real magic-visit-app screens (not the panel's own theme-preview) —
// always light mode, since the mobile app has no dark mode yet.
export function MobilePreview({
  theme,
  appName,
  shortName,
  logoUrl,
}: {
  theme: ThemeDraft;
  appName: string;
  shortName?: string;
  logoUrl?: string;
}) {
  const [screen, setScreen] = React.useState<Screen>("dashboard");
  const brand = React.useMemo(() => {
    try {
      return deriveMobileBrand(theme.light);
    } catch {
      return {
        gradientPrimary: ["#097969", "#0a9070", "#0bb885"] as [string, string, string],
        goldBackground: "#fdf8ed",
        goldBorder: "#e8d98a",
        buttonEdge: "#065c50",
      };
    }
  }, [theme.light]);

  const gradientCss = `linear-gradient(160deg, ${brand.gradientPrimary[0]}, ${brand.gradientPrimary[1]} 55%, ${brand.gradientPrimary[2]})`;

  return (
    <div className="sticky top-6 flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center rounded-full border bg-muted p-1">
        {SCREENS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setScreen(s.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
              screen === s.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Phone chassis — not theme-scoped (it's a physical device, not branded UI);
          fixed pixel size, so it scrolls horizontally in its own box rather than widening the page. */}
      <div className="max-w-full overflow-x-auto">
        <div className="mx-auto w-fit rounded-[2.5rem] border-[6px] border-neutral-900 bg-neutral-900 p-1.5 shadow-xl">
          <div className="relative h-[600px] w-[300px] overflow-hidden rounded-[2rem] bg-white">
            <div className="absolute top-0 left-1/2 z-20 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-neutral-900" />

            {screen === "login" && (
              <LoginScreen gradientCss={gradientCss} buttonEdge={brand.buttonEdge} appName={appName} shortName={shortName} logoUrl={logoUrl} />
            )}
            {screen === "dashboard" && (
              <DashboardScreen
                gradientCss={gradientCss}
                primary={brand.gradientPrimary[0]}
                buttonEdge={brand.buttonEdge}
                goldBg={brand.goldBackground}
                goldBorder={brand.goldBorder}
              />
            )}
            {screen === "profile" && <ProfileScreen primary={brand.gradientPrimary[0]} appName={appName} goldBorder={brand.goldBorder} />}
          </div>
        </div>
      </div>
      <p className="max-w-[300px] text-center text-xs text-muted-foreground">
        Approximate — the real app also derives a gold/neutral accent scale and status colors that stay fixed
        regardless of theme.
      </p>
    </div>
  );
}

function LoginScreen({
  gradientCss,
  buttonEdge,
  appName,
  shortName,
  logoUrl,
}: {
  gradientCss: string;
  buttonEdge: string;
  appName: string;
  shortName?: string;
  logoUrl?: string;
}) {
  return (
    <div className="flex h-full flex-col bg-[#fdf8ed]">
      <div
        className="relative flex flex-col items-center overflow-hidden rounded-b-[2.5rem] px-6 pt-14 pb-12"
        style={{ backgroundImage: gradientCss }}
      >
        <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-6 size-20 rounded-full bg-white/10" />
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="size-14 rounded-2xl bg-white/90 object-contain p-1" />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20">
            <Gem className="size-7 text-white" />
          </div>
        )}
        <p className="mt-3 text-center text-lg font-bold text-white">{appName || "Your App"}</p>
        {shortName && <p className="mt-0.5 text-xs text-white/80">{shortName}</p>}
      </div>

      <div className="-mt-6 flex-1 rounded-t-3xl bg-white p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
        <p className="text-base font-semibold text-neutral-900">Sign in</p>
        <p className="mt-0.5 text-xs text-neutral-500">Use your mobile number and password.</p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5">
            <Phone className="size-4 text-neutral-400" />
            <span className="text-xs text-neutral-400">Mobile number</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5">
            <Lock className="size-4 text-neutral-400" />
            <span className="flex-1 text-xs text-neutral-400">Password</span>
            <Eye className="size-4 text-neutral-400" />
          </div>
        </div>

        {/* Real Button's "3D lip" is a solid edge color, not a shadow — box-shadow is the closest static approximation. */}
        <div
          className="mt-5 mb-1.5 rounded-full py-2.5 text-center text-sm font-semibold text-white"
          style={{ backgroundImage: gradientCss, boxShadow: `0 4px 0 0 ${buttonEdge}` }}
        >
          Sign in
        </div>
      </div>
    </div>
  );
}

const STAT_TILES = [
  { label: "Total visits", value: "1,284" },
  { label: "Conversion", value: "24.6%" },
];

function DashboardScreen({
  gradientCss,
  primary,
  buttonEdge,
  goldBg,
  goldBorder,
}: {
  gradientCss: string;
  primary: string;
  buttonEdge: string;
  goldBg: string;
  goldBorder: string;
}) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: goldBg }}>
      <div className="relative overflow-hidden rounded-b-3xl px-5 pt-14 pb-6" style={{ backgroundImage: gradientCss }}>
        <div className="absolute -top-6 -right-4 size-20 rounded-full bg-white/10" />
        <p className="text-lg font-bold text-white">Hi, Owner! 👋</p>
        <p className="mt-0.5 text-xs text-white/80">Here&apos;s what&apos;s happening today.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5">
          <Calendar className="size-3 text-white" />
          <span className="text-[10px] font-medium text-white">Monday, 18 August</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="grid grid-cols-2 gap-2.5">
          {STAT_TILES.map((tile) => (
            <div key={tile.label} className="rounded-xl border bg-white p-3" style={{ borderColor: goldBorder }}>
              <p className="text-[10px] text-neutral-500">{tile.label}</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">{tile.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pb-1.5">
          <div
            className="flex-1 rounded-full py-2 text-center text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary, boxShadow: `0 3px 0 0 ${buttonEdge}` }}
          >
            Add visitor
          </div>
          <div className="flex-1 rounded-full border py-2 text-center text-[11px] font-semibold" style={{ borderColor: primary, color: primary }}>
            View staff
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3" style={{ borderColor: goldBorder }}>
          <p className="mb-2 text-xs font-semibold text-neutral-900">Recent visits</p>
          {[
            { name: "Priya Sharma", status: "Sold", color: "#22c55e" },
            { name: "Rahul Mehta", status: "Follow up", color: "#8b5cf6" },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between border-t border-neutral-100 py-2 first:border-0">
              <span className="text-xs text-neutral-700">{row.name}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: row.color }}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center justify-around rounded-full border bg-white py-2.5 shadow-sm" style={{ borderColor: goldBorder }}>
        <LayoutGrid className="size-4" style={{ color: primary }} />
        <Users className="size-4 text-neutral-400" />
        <UserCircle2 className="size-4 text-neutral-400" />
      </div>
    </div>
  );
}

function ProfileScreen({ primary, appName, goldBorder }: { primary: string; appName: string; goldBorder: string }) {
  const initials = (appName || "Your App")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menuItems = [
    { icon: Lock, label: "Change password" },
    { icon: Bell, label: "Notifications" },
    { icon: HelpCircle, label: "Help & support" },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b px-4 pt-14 pb-3" style={{ borderColor: goldBorder }}>
        <ChevronLeft className="size-4 text-neutral-500" />
        <p className="text-sm font-semibold text-neutral-900">Profile</p>
      </div>

      <div className="flex flex-col items-center gap-2 py-6">
        <div className="flex size-16 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: primary }}>
          {initials}
        </div>
        <p className="text-sm font-semibold text-neutral-900">Staff Owner</p>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${primary}1A`, color: primary }}>
          Owner
        </span>
      </div>

      <div className="flex-1 px-4">
        {menuItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 border-b border-neutral-100 py-3">
            <item.icon className="size-4" style={{ color: primary }} />
            <span className="flex-1 text-xs text-neutral-700">{item.label}</span>
            <ChevronRight className="size-3.5 text-neutral-300" />
          </div>
        ))}
        <div className="flex items-center gap-3 py-3">
          <LogOut className="size-4 text-red-500" />
          <span className="flex-1 text-xs font-medium text-red-500">Sign out</span>
        </div>
      </div>
    </div>
  );
}
