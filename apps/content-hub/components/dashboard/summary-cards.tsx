"use client";

import { BookOpen, CreditCard, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/actions/dashboard";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function SummaryCards({
  summary,
  revenueLabel,
}: {
  summary: DashboardSummary;
  revenueLabel: string;
}) {
  const cards = [
    {
      title: "Usuários",
      value: summary.totalUsers.toLocaleString("pt-BR"),
      description: "Total de usuários cadastrados",
      icon: Users,
      iconClassName: "text-ch-accent",
    },
    {
      title: "Cursos publicados",
      value: summary.publishedCourses.toLocaleString("pt-BR"),
      description: "Cursos ativos no catálogo",
      icon: BookOpen,
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Solicitações pendentes",
      value: summary.pendingRequests.toLocaleString("pt-BR"),
      description: "Demandas aguardando triagem",
      icon: MessageSquare,
      iconClassName: "text-amber-600 dark:text-amber-400",
    },
    {
      title: `Receita ${revenueLabel.toLowerCase()}`,
      value: currencyFormatter.format(summary.paidRevenueAmount),
      description: `Pagamentos confirmados em ${revenueLabel.toLowerCase()}`,
      icon: CreditCard,
      iconClassName: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ch-muted">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconClassName}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ch">
              {card.value}
            </div>
            <p className="mt-1 text-xs text-ch-muted">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
