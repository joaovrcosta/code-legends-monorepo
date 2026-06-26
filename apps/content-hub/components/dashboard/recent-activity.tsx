"use client";

import Link from "next/link";
import type {
  DashboardRecentPayment,
  DashboardRecentRequest,
} from "@/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const paymentStatusLabel: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  FAILED: "Falhou",
  REFUNDED: "Reembolsado",
};

const paymentStatusClassName: Record<string, string> = {
  PAID: "bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
  PENDING: "bg-amber-900/20 text-amber-700 dark:text-amber-300",
  FAILED: "bg-red-900/20 text-red-700 dark:text-red-300",
  REFUNDED: "bg-ch-surface-raised/50 text-ch-muted",
};

const requestStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Pendente",
  APPROVED: "Concluida",
  REJECTED: "Rejeitada",
};

const requestStatusClassName: Record<string, string> = {
  PENDING: "bg-amber-900/20 text-amber-700 dark:text-amber-300",
  IN_PROGRESS: "bg-amber-900/20 text-amber-700 dark:text-amber-300",
  APPROVED: "bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-900/20 text-red-700 dark:text-red-300",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getPlanLabel(plan: string) {
  return plan === "PREMIUM" ? "Premium" : plan === "PRO" ? "Pro" : "Free";
}

function RequestList({ items }: { items: DashboardRecentRequest[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ch-border p-6 text-sm text-ch-muted border-ch-border text-ch-muted">
        Nenhuma solicitação recente encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((request) => (
        <Link
          key={request.id}
          href={`/requests/${encodeURIComponent(request.id)}`}
          className="block rounded-lg border border-ch-border p-4 transition-colors hover:border-ch-border hover:bg-ch-canvas/80 border-ch-border dark:hover:border-[#3f3f46] dark:hover:bg-white/3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          aria-label={`Ver solicitação: ${request.title || "sem título"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-ch">
                {request.title || "Solicitação sem título"}
              </p>
              <p className="text-sm text-ch-muted">
                {request.userName} • {request.type}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${requestStatusClassName[request.status] ?? requestStatusClassName.PENDING
                }`}
            >
              {requestStatusLabel[request.status] ?? request.status}
            </span>
          </div>
          <p className="mt-3 text-xs text-ch-muted">
            {formatDate(request.createdAt)}
          </p>
        </Link>
      ))}
    </div>
  );
}

function PaymentList({ items }: { items: DashboardRecentPayment[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ch-border p-6 text-sm text-ch-muted border-ch-border text-ch-muted">
        Nenhum pagamento recente encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((payment) => (
        <div
          key={payment.id}
          className="rounded-lg border border-ch-border p-4 border-ch-border"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={`/users/${payment.userId}/overview`}
                className="truncate font-medium text-ch-accent hover:underline text-ch-accent"
              >
                {payment.userName}
              </Link>
              <p className="text-sm text-ch-muted">
                {getPlanLabel(payment.plan)} • {currencyFormatter.format(payment.amount)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusClassName[payment.status] ?? paymentStatusClassName.PENDING
                }`}
            >
              {paymentStatusLabel[payment.status] ?? payment.status}
            </span>
          </div>
          <p className="mt-3 text-xs text-ch-muted">
            {formatDate(payment.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RecentActivity({
  recentRequests,
  recentPayments,
}: {
  recentRequests: DashboardRecentRequest[];
  recentPayments: DashboardRecentPayment[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solicitações recentes</CardTitle>
          <CardDescription>Últimos itens que exigem acompanhamento</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestList items={recentRequests} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pagamentos recentes</CardTitle>
          <CardDescription>Últimas transações registradas na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentList items={recentPayments} />
        </CardContent>
      </Card>
    </div>
  );
}
