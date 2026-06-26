"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { listRequests, type Request } from "@/actions/requests";
import { getAuthTokenFromClient } from "@/lib/auth";
import { RequestStatusBadge } from "@/components/requests/request-admin-detail";
import { toast } from "sonner";

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-ch-border px-3 text-sm font-medium text-ch transition-colors hover:bg-ch-surface-raised border-ch-border text-ch hover:bg-ch-surface-raised";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      const { requests: data } = await listRequests(token);
      setRequests(data);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ch">
            Solicitações
          </h1>
          <p className="mt-2 text-ch-muted">
            Gerencie todas as solicitações dos usuários
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="py-8 text-center text-ch-muted">
                  Nenhuma solicitação encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.user?.name || "N/A"}
                            </div>
                            <div className="text-sm text-ch-muted">
                              {request.user?.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.type}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="truncate font-medium">
                              {request.title || "Sem título"}
                            </div>
                            {request.description ? (
                              <div className="truncate text-sm text-ch-muted">
                                {request.description}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(request.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/requests/${request.id}`}
                            className={outlineLinkClass}
                          >
                            Ver / responder
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
