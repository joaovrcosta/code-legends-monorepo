"use client";

import * as React from "react";
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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
    return Object.entries(config).reduce<React.CSSProperties & Record<string, string>>(
      (acc, [key, value]) => {
        if (value.color) {
          acc[`--color-${key}`] = value.color;
        }

        return acc;
      },
      {}
    );
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn(
          "h-[300px] w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-ch-muted [&_.recharts-cartesian-grid_line]:stroke-ch-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-ch-border [&_.recharts-pie-label-text]:fill-ch-muted",
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

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  payload?: Record<string, unknown> & { fill?: string };
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
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
        "min-w-[180px] rounded-ch-lg border border-ch-border bg-ch-surface px-3 py-2 text-sm shadow-md",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="mb-2 text-xs font-medium text-ch-muted">
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
                <span className="text-ch-muted">
                  {itemConfig?.label ?? item.name ?? key}
                </span>
              </div>
              <span className="font-medium text-ch">
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

type LegendPayloadItem = {
  value?: string;
  dataKey?: string | number;
  color?: string;
};

export function ChartLegendContent({
  payload,
  className,
}: {
  payload?: LegendPayloadItem[];
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
          <div key={key} className="flex items-center gap-2 text-sm text-ch-muted">
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
