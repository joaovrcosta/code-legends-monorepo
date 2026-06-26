"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { DashboardRevenueMeta, DashboardRevenuePoint, RevenueRangePreset } from "@/actions/dashboard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { chartColors } from "@/lib/chart-theme";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const presetOptions: Array<{ value: RevenueRangePreset; label: string }> = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
  { value: "custom", label: "Personalizado" },
];

export function RevenueChart({
  data,
  meta,
  selectedPreset,
  customFrom,
  customTo,
  loading,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustomRange,
}: {
  data: DashboardRevenuePoint[];
  meta: DashboardRevenueMeta;
  selectedPreset: RevenueRangePreset;
  customFrom: string;
  customTo: string;
  loading: boolean;
  onPresetChange: (value: RevenueRangePreset) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onApplyCustomRange: () => void;
}) {
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-lg">Receita</CardTitle>
            <CardDescription>{meta.description}</CardDescription>
          </div>

          <div className="w-full max-w-sm">
            <Label htmlFor="revenue-range" className="text-xs text-ch-muted">
              Período
            </Label>
            <Select
              id="revenue-range"
              value={selectedPreset}
              onChange={(event) => onPresetChange(event.target.value as RevenueRangePreset)}
              className="mt-1"
              disabled={loading}
            >
              {presetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {selectedPreset === "custom" ? (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div>
              <Label htmlFor="revenue-from" className="text-xs text-ch-muted">
                Data inicial
              </Label>
              <Input
                id="revenue-from"
                type="date"
                value={customFrom}
                onChange={(event) => onCustomFromChange(event.target.value)}
                max={customTo || undefined}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="revenue-to" className="text-xs text-ch-muted">
                Data final
              </Label>
              <Input
                id="revenue-to"
                type="date"
                value={customTo}
                onChange={(event) => onCustomToChange(event.target.value)}
                min={customFrom || undefined}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onApplyCustomRange}
                disabled={loading || !customFrom || !customTo}
                className="w-full"
              >
                Aplicar
              </Button>
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Receita",
              color: chartColors.accent,
            },
          }}
          className="h-[320px]"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  valueFormatter={(value) =>
                    currencyFormatter.format(value)
                  }
                />
              }
            />
            <Area
              dataKey="revenue"
              fill="url(#fillRevenue)"
              fillOpacity={1}
              stroke="var(--color-revenue)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
