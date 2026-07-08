"use client";

import { Zap } from "lucide-react";

type PlanBadgePreviewProps = {
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

function planBadgeBackground(colorHex?: string | null): string {
  const rgb = parseHex(colorHex);
  if (!rgb) {
    return (
      SEED_GRADIENT_BY_SLUG.pro ??
      "linear-gradient(135deg, #8234E9 0%, #9B4DE0 50%, #A855F7 100%)"
    );
  }

  const lighten = (v: number) => Math.round(v + (255 - v) * 0.25);
  const darken = (v: number) => Math.round(v * 0.85);

  return `linear-gradient(135deg, rgb(${lighten(rgb.r)}, ${lighten(rgb.g)}, ${lighten(rgb.b)}) 0%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) 50%, rgb(${darken(rgb.r)}, ${darken(rgb.g)}, ${darken(rgb.b)}) 100%)`;
}

export function PlanBadgePreview({
  name,
  colorHex,
  imageUrl,
}: PlanBadgePreviewProps) {
  const label = name?.trim() || "Nome do plano";
  const iconSrc = imageUrl?.trim();

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">Preview do badge</p>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
        style={{ background: planBadgeBackground(colorHex) }}
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
    </div>
  );
}
