"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  CreditCard,
  Layers,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  getDashboardOverview,
  type DashboardOverview,
  type RevenueRange,
  type RevenueRangePreset,
} from "@/actions/dashboard";
import { MainLayout } from "@/components/layout/main-layout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopSkillsChart } from "@/components/dashboard/top-skills-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthTokenFromClient } from "@/lib/auth";

const quickLinks = [
  {
    title: "Cursos",
    description: "Gerenciar catálogo e publicações",
    href: "/courses",
    icon: BookOpen,
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Usuários",
    description: "Acompanhar contas e planos",
    href: "/users",
    icon: Users,
    iconClassName: "text-orange-600 dark:text-orange-400",
  },
  {
    title: "Pagamentos",
    description: "Consultar transações recentes",
    href: "/payments",
    icon: CreditCard,
    iconClassName: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Solicitações",
    description: "Responder backlog operacional",
    href: "/requests",
    icon: MessageSquare,
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Categorias",
    description: "Organizar a taxonomia do hub",
    href: "/categories",
    icon: Layers,
    iconClassName: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Skills",
    description: "Relacionar habilidades aos cursos",
    href: "/skills",
    icon: Brain,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <div className="h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
            <CardContent>
              <div className="h-[260px] animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuickLinksSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Acesso rápido
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Atalhos para as áreas mais usadas do Content Hub
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <item.icon className={`h-4 w-4 ${item.iconClassName}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>({ preset: "30d" });
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const loadDashboard = useCallback(async (range: RevenueRange) => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthTokenFromClient();
      if (!token) {
        setError("Sessão inválida. Faça login novamente para carregar o dashboard.");
        setDashboard(null);
        return;
      }

      const data = await getDashboardOverview(token, range);
      setDashboard(data);
      setCustomFrom(data.revenueMeta.from ?? "");
      setCustomTo(data.revenueMeta.to ?? "");
    } catch (loadError) {
      console.error("Erro ao carregar dashboard:", loadError);
      setError("Não foi possível carregar os indicadores da home.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard({ preset: "30d" });
  }, [loadDashboard]);

  const handleRevenuePresetChange = async (preset: RevenueRangePreset) => {
    const nextRange =
      preset === "custom"
        ? {
            preset,
            from: customFrom || dashboard?.revenueMeta.from,
            to: customTo || dashboard?.revenueMeta.to,
          }
        : { preset };

    setRevenueRange(nextRange);

    if (preset !== "custom") {
      await loadDashboard(nextRange);
    }
  };

  const handleApplyCustomRange = async () => {
    if (!customFrom || !customTo) {
      setError("Selecione uma data inicial e final para o período personalizado.");
      return;
    }

    const nextRange: RevenueRange = {
      preset: "custom",
      from: customFrom,
      to: customTo,
    };

    setRevenueRange(nextRange);
    await loadDashboard(nextRange);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visão consolidada de catálogo, usuários, monetização e operação do Content Hub.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => loadDashboard(revenueRange)}
            disabled={loading}
            className="w-full lg:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Atualizando..." : "Atualizar dados"}
          </Button>
        </div>

        {loading && !dashboard ? <DashboardSkeleton /> : null}

        {!loading && error && !dashboard ? (
          <Card>
            <CardHeader>
              <CardTitle>Erro ao carregar dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadDashboard(revenueRange)}>Tentar novamente</Button>
            </CardContent>
          </Card>
        ) : null}

        {dashboard ? (
          <>
            {error ? (
              <Card className="border-amber-300 dark:border-amber-700">
                <CardContent className="pt-6 text-sm text-amber-700 dark:text-amber-300">
                  {error}
                </CardContent>
              </Card>
            ) : null}

            <SummaryCards summary={dashboard.summary} revenueLabel={dashboard.revenueMeta.label} />

            <div className="grid gap-6 xl:grid-cols-3">
              <StatusDistributionChart
                title="Usuários por plano"
                description="Distribuição atual entre Free, Pro e Premium"
                data={dashboard.usersByPlan}
              />
              <StatusDistributionChart
                title="Cursos por status"
                description="Relação entre cursos publicados e em rascunho"
                data={dashboard.coursesByStatus}
              />
              <StatusDistributionChart
                title="Solicitações por status"
                description="Panorama do backlog operacional"
                data={dashboard.requestsByStatus}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <RevenueChart
                data={dashboard.revenueByMonth}
                meta={dashboard.revenueMeta}
                selectedPreset={revenueRange.preset}
                customFrom={customFrom}
                customTo={customTo}
                loading={loading}
                onPresetChange={handleRevenuePresetChange}
                onCustomFromChange={setCustomFrom}
                onCustomToChange={setCustomTo}
                onApplyCustomRange={handleApplyCustomRange}
              />
              <TopSkillsChart data={dashboard.topSkills} />
            </div>

            <RecentActivity
              recentRequests={dashboard.recentRequests}
              recentPayments={dashboard.recentPayments}
            />

            <QuickLinksSection />
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}
