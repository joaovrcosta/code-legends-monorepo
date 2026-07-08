"use client";

import { Zap } from "lucide-react";

type PlanBadgeProps = {
  slug?: string | null;
  name?: string | null;
  colorHex?: string | null;
  imageUrl?: string | null;
};

const SEED_GRADIENT_BY_SLUG: Record<string, string> = {
  pro: "linear-gradient(135deg, #8234E9 0%, #9B4DE0 50%, #A855F7 100%)",
  premium:
    "linear-gradient(135deg, #FF6200 0%, #FF8533 50%, #E55A00 100%)",
};

function parseHex(hex?: string | null): { r: number; g: number; b: number } | null {
  if (!hex?.trim()) return null;
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

function planBadgeBackground(
  slug?: string | null,
  colorHex?: string | null,
): string {
  const rgb = parseHex(colorHex);
  if (!rgb) {
    const normalizedSlug = slug?.toLowerCase();
    if (normalizedSlug && SEED_GRADIENT_BY_SLUG[normalizedSlug]) {
      return SEED_GRADIENT_BY_SLUG[normalizedSlug]!;
    }
    return SEED_GRADIENT_BY_SLUG.pro!;
  }

  const lighten = (v: number) => Math.round(v + (255 - v) * 0.25);
  const darken = (v: number) => Math.round(v * 0.85);

  return `linear-gradient(135deg, rgb(${lighten(rgb.r)}, ${lighten(rgb.g)}, ${lighten(rgb.b)}) 0%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) 50%, rgb(${darken(rgb.r)}, ${darken(rgb.g)}, ${darken(rgb.b)}) 100%)`;
}

function formatPlanLabel(
  slug?: string | null,
  name?: string | null,
): string {
  if (name?.trim()) return name.trim();
  if (!slug) return "Free";
  if (slug.toUpperCase() === "FREE") return "Free";
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

export function PlanBadge({
  slug,
  name,
  colorHex,
  imageUrl,
}: PlanBadgeProps) {
  const normalizedSlug = slug?.toUpperCase() ?? "FREE";

  if (normalizedSlug === "FREE") {
    return (
      <span className="inline-flex items-center rounded-full bg-lime-900/20 px-2.5 py-1 text-xs font-medium text-lime-700 dark:bg-lime-500/20 dark:text-lime-300">
        Free
      </span>
    );
  }

  const label = formatPlanLabel(slug, name);
  const iconSrc = imageUrl?.trim();

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ background: planBadgeBackground(slug, colorHex) }}
    >
      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconSrc}
          alt=""
          className="h-3 w-3 shrink-0 rounded-full object-cover"
        />
      ) : (
        <Zap className="h-3 w-3 shrink-0 fill-white text-white" />
      )}
      {label}
    </span>
  );
}
