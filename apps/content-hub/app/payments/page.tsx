"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPayments, type PaymentItem } from "@/actions/payment/list-payments";
import { getAuthTokenFromClient } from "@/lib/auth";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      const { payments: data } = await listPayments(token || undefined);
      setPayments(data);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanLabel = (plan: string) =>
    plan === "PREMIUM" ? "Premium" : plan === "PRO" ? "Pro" : "Free";

  const getStatusBadge = (status: string) => {
    const classes =
      status === "PAID"
        ? "bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
        : status === "PENDING"
          ? "bg-amber-900/20 text-amber-700 dark:text-amber-300"
          : status === "FAILED"
            ? "bg-red-900/20 text-red-700 dark:text-red-300"
            : "bg-gray-900/20 text-gray-700 dark:text-gray-300";
    const label =
      status === "PAID"
        ? "Pago"
        : status === "PENDING"
          ? "Pendente"
          : status === "FAILED"
            ? "Falhou"
            : status === "REFUNDED"
              ? "Reembolsado"
              : status;
    return <span className={`px-2 py-0.5 rounded text-xs ${classes}`}>{label}</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-gray-900 dark:text-gray-100" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Pagamentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Todos os pagamentos da plataforma
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum pagamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {formatDate(p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/users/${p.userId}/overview`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {p.userName}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.userEmail}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: p.currency,
                          }).format(p.amountCents / 100)}
                        </TableCell>
                        <TableCell>{getPlanLabel(p.plan)}</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell>{p.gateway}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {p.paidAt ? formatDate(p.paidAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
