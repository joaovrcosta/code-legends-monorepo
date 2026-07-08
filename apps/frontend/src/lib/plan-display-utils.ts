import type { CSSProperties } from "react";

const PLAN_ICON_BY_SLUG: Record<string, string> = {
  pro: "/pro-plan-icon.svg",
  premium: "/premium-plan-icon.svg",
};

const PLAN_COLOR_BY_SLUG: Record<string, string> = {
  pro: "#8234E9",
  premium: "#FF6200",
};

const SEED_GRADIENT_BY_SLUG: Record<string, string> = {
  pro: "linear-gradient(135deg, #8234E9 0%, #9B4DE0 50%, #A855F7 100%)",
  premium:
    "linear-gradient(135deg, #FF6200 0%, #FF8533 50%, #E55A00 100%)",
};

function parseHex(hex?: string | null): { r: number; g: number; b: number } | null {
  if (!hex) return null;

  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function lightenChannel(value: number, amount: number): number {
  return clampChannel(value + (255 - value) * amount);
}

function darkenChannel(value: number, amount: number): number {
  return clampChannel(value * (1 - amount));
}

export function isUnpaidPlanSlug(slug?: string | null): boolean {
  const normalized = String(slug ?? "").trim().toUpperCase();
  return !normalized || normalized === "FREE";
}

export function isPaidPlanSlug(slug?: string | null): boolean {
  return !isUnpaidPlanSlug(slug);
}

export function toDisplayPlanSlug(slug?: string | null): string {
  if (isUnpaidPlanSlug(slug)) return "";
  return String(slug ?? "").trim().toUpperCase();
}

export function resolvePlanIcon(
  slug?: string | null,
  imageUrl?: string | null,
): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  const normalized = slug?.toLowerCase().trim() ?? "";
  return PLAN_ICON_BY_SLUG[normalized] ?? "/pro-plan-icon.svg";
}

export function resolvePlanColorHex(
  slug?: string | null,
  colorHex?: string | null,
): string | null {
  if (colorHex?.trim()) return colorHex.trim();
  const normalized = slug?.toLowerCase().trim() ?? "";
  return PLAN_COLOR_BY_SLUG[normalized] ?? null;
}

export function formatPlanBadgeLabel(
  name?: string | null,
  slug?: string | null,
): string {
  if (name?.trim()) return name.trim();
  if (isUnpaidPlanSlug(slug)) return "";
  const normalized = slug?.trim();
  if (!normalized) return "";
  return normalized
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function planBadgeBackgroundStyle(
  colorHex?: string | null,
  slug?: string | null,
): string {
  const normalizedSlug = slug?.toLowerCase().trim() ?? "";
  const seedGradient = SEED_GRADIENT_BY_SLUG[normalizedSlug];
  if (seedGradient && !colorHex?.trim()) return seedGradient;

  const resolvedHex = resolvePlanColorHex(slug, colorHex);
  const rgb = parseHex(resolvedHex);
  if (!rgb) {
    return (
      SEED_GRADIENT_BY_SLUG.pro ??
      "linear-gradient(135deg, #8234E9 0%, #9B4DE0 50%, #A855F7 100%)"
    );
  }

  const light = {
    r: lightenChannel(rgb.r, 0.25),
    g: lightenChannel(rgb.g, 0.25),
    b: lightenChannel(rgb.b, 0.25),
  };
  const dark = {
    r: darkenChannel(rgb.r, 0.15),
    g: darkenChannel(rgb.g, 0.15),
    b: darkenChannel(rgb.b, 0.15),
  };

  return `linear-gradient(135deg, rgb(${light.r}, ${light.g}, ${light.b}) 0%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) 50%, rgb(${dark.r}, ${dark.g}, ${dark.b}) 100%)`;
}

export function planAvatarRingStyle(
  colorHex?: string | null,
  slug?: string | null,
): CSSProperties {
  return { background: planBadgeBackgroundStyle(colorHex, slug) };
}
