// A fixed, pre-validated 8-hue categorical bank for chart-2..5 (chart-1 is
// always the tenant's own primary — see getChartPalette below). The hues,
// fixed order, and light/dark hex steps are the dataviz skill's validated
// reference palette (references/palette.md): each adjacent pair clears the
// CVD-safety ΔE gates in both modes, so as long as slots are consumed in
// this fixed order (never cycled/reordered) the result stays distinguishable.
import { hexToOklch, hueDistance, type Oklch } from "@/lib/theme/oklch";

interface BankHue {
  name: string;
  light: string;
  dark: string;
}

// Fixed order — do not reorder. See references/palette.md in the dataviz
// skill for the validation this order and these exact hex steps passed.
const BANK: BankHue[] = [
  { name: "blue", light: "#2a78d6", dark: "#3987e5" },
  { name: "orange", light: "#eb6834", dark: "#d95926" },
  { name: "aqua", light: "#1baf7a", dark: "#199e70" },
  { name: "yellow", light: "#eda100", dark: "#c98500" },
  { name: "magenta", light: "#e87ba4", dark: "#d55181" },
  { name: "green", light: "#008300", dark: "#008300" },
  { name: "violet", light: "#4a3aa7", dark: "#9085e9" },
  { name: "red", light: "#e34948", dark: "#e66767" },
];

const SKIP_HUE_DISTANCE = 90;

// Legible band for chart-1 (the tenant's own primary, reused as a chart
// color) — matches the dataviz skill's categorical lightness band so it
// doesn't disappear against the chart surface: OKLCH L ~0.43-0.77 light,
// ~0.48-0.67 dark, chroma floor ~0.10.
const LIGHTNESS_BAND = {
  light: { min: 0.43, max: 0.77 },
  dark: { min: 0.48, max: 0.67 },
};
const CHROMA_FLOOR = 0.1;

function clampForChart(color: Oklch, mode: "light" | "dark"): Oklch {
  const band = LIGHTNESS_BAND[mode];
  return {
    l: Math.min(band.max, Math.max(band.min, color.l)),
    c: Math.max(CHROMA_FLOOR, color.c),
    h: color.h,
  };
}

/**
 * chart-1 = the tenant's primary, clamped into a legible band.
 * chart-2..5 = the next 4 bank hues in fixed order, skipping any within
 * ~90° hue of the tenant's primary to avoid a near-collision with chart-1.
 */
export function getChartPalette(primary: Oklch, mode: "light" | "dark"): [Oklch, Oklch, Oklch, Oklch, Oklch] {
  const chart1 = clampForChart(primary, mode);

  const bankOklch = BANK.map((entry) => hexToOklch(entry[mode]));

  const farEnough = bankOklch.filter((color) => hueDistance(color.h, chart1.h) > SKIP_HUE_DISTANCE);
  const rest = bankOklch.filter((color) => hueDistance(color.h, chart1.h) <= SKIP_HUE_DISTANCE);

  // Fixed bank order is preserved within each bucket; only the exclusion is
  // hue-dependent. If filtering leaves fewer than 4 (primary sits near more
  // than half the bank), fill the remainder from the excluded set, still in
  // original bank order, so there are always 5 colors on offer.
  const ordered = [...farEnough, ...rest].slice(0, 4) as [Oklch, Oklch, Oklch, Oklch];

  return [chart1, ...ordered];
}
