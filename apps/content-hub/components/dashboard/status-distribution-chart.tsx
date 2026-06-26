"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardOverview } from "@/actions/dashboard";

type DistributionDatum = DashboardOverview["usersByPlan"][number];

function hasVisibleValues(data: DistributionDatum[]) {
  return data.some((item) => item.value > 0);
}

export function StatusDistributionChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: DistributionDatum[];
}) {
  const config = data.reduce<ChartConfig>((acc, item) => {
    acc[item.key] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {});

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasVisibleValues(data) ? (
          <>
            <ChartContainer config={config} className="h-[260px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  strokeWidth={0}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 text-center text-sm text-ch-muted">
              Total: <span className="font-medium text-ch">{total}</span>
            </div>
          </>
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-ch-border text-sm text-ch-muted border-ch-border text-ch-muted">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
