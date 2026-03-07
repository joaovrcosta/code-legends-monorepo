"use client";

import * as React from "react";
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type LegendProps,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }

  return context;
}

export function ChartContainer({
  config,
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
  children: React.ReactNode;
}) {
  const style = React.useMemo(() => {
    return Object.entries(config).reduce<React.CSSProperties>((acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}` as keyof React.CSSProperties] = value.color;
      }

      return acc;
    }, {});
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn(
          "h-[300px] w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-gray-500 [&_.recharts-cartesian-grid_line]:stroke-gray-200 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-300 [&_.recharts-pie-label-text]:fill-gray-600 dark:[&_.recharts-cartesian-axis-tick_text]:fill-gray-400 dark:[&_.recharts-cartesian-grid_line]:stroke-[#25252a] dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-600 dark:[&_.recharts-pie-label-text]:fill-gray-300",
          className
        )}
        style={style}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  valueFormatter,
}: TooltipProps<number, string> & {
  className?: string;
  hideLabel?: boolean;
  valueFormatter?: (value: number, name: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-[#25252a] dark:bg-[#1a1a1e]",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </div>
      ) : null}

      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const itemConfig = config[key];
          const indicatorColor =
            item.color ?? item.payload?.fill ?? itemConfig?.color ?? "currentColor";

          return (
            <div key={`${key}-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: indicatorColor }}
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {itemConfig?.label ?? item.name ?? key}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {typeof item.value === "number"
                  ? valueFormatter?.(item.value, key) ?? item.value.toLocaleString("pt-BR")
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendContent({
  payload,
  className,
}: LegendProps & {
  className?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-4", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value);
        const itemConfig = config[key];

        return (
          <div key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color ?? itemConfig?.color ?? "currentColor" }}
            />
            <span>{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
