"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { getRequestById, updateRequest, type Request } from "@/actions/requests";
import { getAuthTokenFromClient } from "@/lib/auth";
import { RequestAdminDetail } from "@/components/requests/request-admin-detail";
import { toast } from "sonner";

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-ch-border px-3 text-sm font-medium text-gray-900 transition-colors hover:bg-ch-surface-raised border-ch-border text-ch hover:bg-ch-surface-raised";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { request: data, message } = await getRequestById(id, token);
    if (!data) {
      toast.error(message || "Solicitação não encontrada");
      setRequest(null);
    } else {
      setRequest(data);
      setResponse(data.response || "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSendMessage = async () => {
    if (!request) return;
    const trimmed = response.trim();
    if (!trimmed) {
      toast.error("Digite uma mensagem antes de enviar.");
      return;
    }
    if (trimmed === (request.response ?? "").trim()) {
      toast.info("Altere o texto para enviar uma nova mensagem.");
      return;
    }
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }
    setSendingMessage(true);
    try {
      const result = await updateRequest(
        request.id,
        { response: trimmed },
        token
      );
      if (result.success) {
        toast.success("Mensagem enviada. O usuário será notificado.");
        await load();
      } else {
        toast.error(result.message || "Erro ao enviar mensagem");
      }
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!request) return;
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }
    setUpdatingStatus(true);
    try {
      const result = await updateRequest(
        request.id,
        { status, response: response || undefined },
        token
      );
      if (result.success) {
        toast.success(result.message || "Solicitação atualizada");
        router.push("/requests");
        router.refresh();
      } else {
        toast.error(result.message || "Erro ao atualizar solicitação");
      }
    } catch {
      toast.error("Erro ao atualizar solicitação");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/requests" className={outlineLinkClass}>
            ← Voltar à lista
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ch-muted">
            Carregando…
          </div>
        ) : request ? (
          <RequestAdminDetail
            request={request}
            response={response}
            onResponseChange={setResponse}
            onSendMessage={handleSendMessage}
            sendingMessage={sendingMessage}
            onUpdateStatus={handleUpdateStatus}
            updatingStatus={updatingStatus}
          />
        ) : (
          <p className="text-center text-ch-muted">
            Não foi possível carregar esta solicitação.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
