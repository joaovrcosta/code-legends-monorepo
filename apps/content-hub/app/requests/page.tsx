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
import { Textarea } from "@/components/ui/textarea";
import { listRequests, updateRequest, type Request } from "@/actions/requests";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, X } from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Pendente",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock,
  },
  APPROVED: {
    label: "Aprovada",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejeitada",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: AlertCircle,
  },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
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

  const handleOpenDialog = (request: Request) => {
    setSelectedRequest(request);
    setResponse(request.response || "");
    setShowDialog(true);
  };

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED" | "IN_PROGRESS") => {
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }

      const result = await updateRequest(
        selectedRequest.id,
        {
          status,
          response: response || undefined,
        },
        token
      );

      if (result.success) {
        setShowDialog(false);
        setSelectedRequest(null);
        setResponse("");
        loadRequests();
      } else {
        alert(result.message || "Erro ao atualizar solicitação");
      }
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error);
      alert("Erro ao atualizar solicitação");
    } finally {
      setUpdating(false);
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

  const getStatusBadge = (status: Request["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Solicitações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie todas as solicitações dos usuários
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {request.user?.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.type}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">
                              {request.title || "Sem título"}
                            </div>
                            {request.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {request.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(request.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(request)}
                          >
                            Ver/Responder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal para ver/responder solicitação */}
        {showDialog && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    Solicitação #{selectedRequest.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedRequest.user?.name} ({selectedRequest.user?.email})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedRequest(null);
                    setResponse("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <div className="mt-1 text-sm">{selectedRequest.type}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Título</label>
                  <div className="mt-1 text-sm">
                    {selectedRequest.title || "Sem título"}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <div className="mt-1 text-sm whitespace-pre-wrap">
                    {selectedRequest.description || "Sem descrição"}
                  </div>
                </div>

                {selectedRequest.data && (
                  <div>
                    <label className="text-sm font-medium">Dados Adicionais</label>
                    <div className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(JSON.parse(selectedRequest.data), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Status Atual</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                {selectedRequest.response && (
                  <div>
                    <label className="text-sm font-medium">Resposta Anterior</label>
                    <div className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      {selectedRequest.response}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Resposta</label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Digite sua resposta ou observação..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setSelectedRequest(null);
                      setResponse("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    disabled={updating}
                    className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {updating ? "Atualizando..." : "Em Andamento"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("REJECTED")}
                    disabled={updating}
                    className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {updating ? "Rejeitando..." : "Rejeitar"}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus("APPROVED")}
                    disabled={updating}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    {updating ? "Aprovando..." : "Aprovar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
