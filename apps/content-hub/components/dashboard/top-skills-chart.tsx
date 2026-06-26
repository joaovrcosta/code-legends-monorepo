"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DashboardOverview } from "@/actions/dashboard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TopSkillDatum = DashboardOverview["topSkills"][number];

export function TopSkillsChart({ data }: { data: TopSkillDatum[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top skills</CardTitle>
        <CardDescription>Skills mais associadas aos cursos cadastrados</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer
            config={data.reduce((acc, skill) => {
              acc[skill.key] = {
                label: skill.name,
                color: skill.fill,
              };
              return acc;
            }, {} as Record<string, { label: string; color: string }>)}
            className="h-[320px]"
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 12 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                axisLine={false}
                dataKey="name"
                tickLine={false}
                type="category"
                width={100}
              />
              <XAxis axisLine={false} tickLine={false} type="number" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={6} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-ch-border text-sm text-ch-muted border-ch-border text-ch-muted">
            Nenhuma skill com cursos vinculados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
