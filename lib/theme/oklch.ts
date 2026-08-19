// Pure OKLCH <-> sRGB conversion, no DOM/React imports (portable for future mobile/NativeWind use).
// Math follows Björn Ottosson's OKLab reference: https://bottosson.github.io/posts/oklab/

export interface Oklch {
  l: number; // 0..1
  c: number; // chroma, typically 0..~0.4
  h: number; // hue, degrees 0..360
  alpha?: number; // 0..1, defaults to 1 (opaque)
}

const OKLCH_RE = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%)?\s*)?\)/i;

/** Parses a CSS `oklch(L C H)` / `oklch(L C H / A%)` string. */
export function parseOklch(input: string): Oklch {
  const match = OKLCH_RE.exec(input.trim());
  if (!match) {
    throw new Error(`Not a valid oklch() string: "${input}"`);
  }
  const [, lRaw, cRaw, hRaw, aRaw, aPercentSign] = match;
  const l = Number(lRaw);
  const c = Number(cRaw);
  const h = Number(hRaw);
  let alpha = 1;
  if (aRaw !== undefined) {
    alpha = aPercentSign ? Number(aRaw) / 100 : Number(aRaw);
  }
  return { l, c, h, alpha };
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** Formats an Oklch value back into a CSS `oklch()` string. */
export function formatOklch(color: Oklch): string {
  const l = round(color.l, 4);
  const c = round(Math.max(0, color.c), 4);
  const h = round(((color.h % 360) + 360) % 360, 2);
  if (color.alpha !== undefined && color.alpha < 1) {
    return `oklch(${l} ${c} ${h} / ${round(color.alpha * 100, 2)}%)`;
  }
  return `oklch(${l} ${c} ${h})`;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cbrt(x: number): number {
  return Math.sign(x) * Math.abs(x) ** (1 / 3);
}

interface LinearRgb {
  r: number;
  g: number;
  b: number;
}

function oklchToOklab(color: Oklch): { l: number; a: number; b: number } {
  const hRad = (color.h * Math.PI) / 180;
  return {
    l: color.l,
    a: color.c * Math.cos(hRad),
    b: color.c * Math.sin(hRad),
  };
}

function oklabToOklch(lab: { l: number; a: number; b: number }): Oklch {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l, c, h };
}

function oklabToLinearSrgb(lab: { l: number; a: number; b: number }): LinearRgb {
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function linearSrgbToOklab(rgb: LinearRgb): { l: number; a: number; b: number } {
  const l = 0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b;
  const m = 0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b;
  const s = 0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b;

  const l_ = cbrt(l);
  const m_ = cbrt(m);
  const s_ = cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function linearToGamma(c: number): number {
  const clamped = clamp01(c);
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function gammaToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export interface Rgb {
  r: number; // 0..255
  g: number;
  b: number;
}

export function oklchToRgb(color: Oklch): Rgb {
  const lab = oklchToOklab(color);
  const linear = oklabToLinearSrgb(lab);
  return {
    r: Math.round(clamp01(linearToGamma(linear.r)) * 255),
    g: Math.round(clamp01(linearToGamma(linear.g)) * 255),
    b: Math.round(clamp01(linearToGamma(linear.b)) * 255),
  };
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const linear: LinearRgb = {
    r: gammaToLinear(rgb.r / 255),
    g: gammaToLinear(rgb.g / 255),
    b: gammaToLinear(rgb.b / 255),
  };
  const lab = linearSrgbToOklab(linear);
  return oklabToOklch(lab);
}

function toHex2(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
}

export function oklchToHex(color: Oklch): string {
  const { r, g, b } = oklchToRgb(color);
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

export function hexToOklch(hex: string): Oklch {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return rgbToOklch({ r, g, b });
}

/** Linear interpolation, wrapping correctly around the 0/360 hue seam. */
function lerpHue(h1: number, h2: number, t: number): number {
  const delta = ((h2 - h1 + 540) % 360) - 180;
  return (h1 + delta * t + 360) % 360;
}

export function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  const clampedT = clamp01(t);
  return {
    l: a.l + (b.l - a.l) * clampedT,
    c: a.c + (b.c - a.c) * clampedT,
    h: a.c === 0 && b.c === 0 ? a.h : lerpHue(a.h, b.h, clampedT),
    alpha: (a.alpha ?? 1) + ((b.alpha ?? 1) - (a.alpha ?? 1)) * clampedT,
  };
}

export function clampOklch(color: Oklch, overrides: Partial<{ minL: number; maxL: number; minC: number }>): Oklch {
  let { l, c } = color;
  if (overrides.minL !== undefined) l = Math.max(overrides.minL, l);
  if (overrides.maxL !== undefined) l = Math.min(overrides.maxL, l);
  if (overrides.minC !== undefined) c = Math.max(overrides.minC, c);
  return { ...color, l, c };
}

/** Circular hue distance in degrees, always in [0, 180]. */
export function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}
