"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPlans, type Plan } from "@/actions/plan";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Plus, Edit, Crown } from "lucide-react";
import Link from "next/link";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      const { plans: data } = await listPlans(token ?? undefined);
      setPlans(data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-gray-900 dark:text-gray-100" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Planos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie os planos de assinatura da plataforma
              </p>
            </div>
          </div>
          <Link href="/plans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum plano encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-mono text-sm">
                          {plan.slug}
                        </TableCell>
                        <TableCell className="font-medium">
                          {plan.name}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(plan.amountCents / 100)}
                        </TableCell>
                        <TableCell>{plan.order}</TableCell>
                        <TableCell>
                          <span
                            className={
                              plan.active
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-500"
                            }
                          >
                            {plan.active ? "Sim" : "Não"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/plans/${plan.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
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
