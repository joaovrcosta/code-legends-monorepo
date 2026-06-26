/**
 * Cores de gráficos — valores espelhados de styles/tokens.css (dark).
 * Sync manual: ao mudar --ch-accent em tokens.css, atualize aqui se necessário.
 */
export const chartColors = {
  accent: "#00b3e4",
  accentHover: "#35bed5",
  muted: "#94a3b8",
  border: "#27272a",
  surface: "#18181b",
  series: ["#00b3e4", "#35bed5", "#22d3ee", "#06b6d4", "#0891b2"] as const,
} as const;

export function getChartConfig(
  keys: Array<{ key: string; label: string; colorIndex?: number }>
) {
  return keys.reduce(
    (acc, { key, label, colorIndex = 0 }) => {
      acc[key] = {
        label,
        color: chartColors.series[colorIndex % chartColors.series.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );
}
