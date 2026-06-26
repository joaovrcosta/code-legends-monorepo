"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
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
import { getAuthTokenFromClient } from "@/lib/auth";
import { adminDeleteCareer, adminListCareers, type Career } from "@/actions/career";

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      const { careers } = await adminListCareers(token || undefined);
      setCareers(careers);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar carreiras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => {
    return [...careers].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [careers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar esta carreira?")) return;
    try {
      const token = getAuthTokenFromClient();
      await adminDeleteCareer(id, token || undefined);
      toast.success("Carreira desativada.");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao desativar carreira");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Carreiras"
          description="Cadastre trilhas/carreiras, módulos e exames."
          actions={
            <Link href="/careers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Carreira
              </Button>
            </Link>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Carreiras</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-ch-muted">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-ch-muted">
                        Nenhuma carreira encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.slug}</TableCell>
                        <TableCell>
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              c.active
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                : "bg-ch-surface-raised text-ch-muted",
                            ].join(" ")}
                          >
                            {c.active ? "Ativa" : "Inativa"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/careers/${c.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
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

