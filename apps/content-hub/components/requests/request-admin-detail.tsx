import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Request } from "@/actions/requests";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

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
} as const;

export function RequestStatusBadge({ status }: { status: Request["status"] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} flex w-fit items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function formatDataJson(data: string): string {
  try {
    return JSON.stringify(JSON.parse(data), null, 2);
  } catch {
    return data;
  }
}

export type RequestAdminDetailProps = {
  request: Request;
  response: string;
  onResponseChange: (value: string) => void;
  /** Gravar só a mensagem (notifica o usuário sem mudar status). */
  onSendMessage: () => void | Promise<void>;
  sendingMessage: boolean;
  onUpdateStatus: (status: "APPROVED" | "REJECTED" | "IN_PROGRESS") => void;
  updatingStatus: boolean;
  headerExtra?: ReactNode;
};

export function RequestAdminDetail({
  request,
  response,
  onResponseChange,
  onSendMessage,
  sendingMessage,
  onUpdateStatus,
  updatingStatus,
  headerExtra,
}: RequestAdminDetailProps) {
  const trimmedDraft = response.trim();
  const savedTrimmed = (request.response ?? "").trim();
  const hasNewMessage =
    trimmedDraft.length > 0 && trimmedDraft !== savedTrimmed;
  const anyBusy = sendingMessage || updatingStatus;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <CardTitle className="break-all">
            Solicitação #{request.id.slice(0, 8)}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {request.user?.name} ({request.user?.email})
          </p>
        </div>
        {headerExtra}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <div className="mt-1 text-sm">{request.type}</div>
        </div>

        <div>
          <label className="text-sm font-medium">Título</label>
          <div className="mt-1 text-sm">{request.title || "Sem título"}</div>
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <div className="mt-1 text-sm whitespace-pre-wrap">
            {request.description || "Sem descrição"}
          </div>
        </div>

        {request.data ? (
          <div>
            <label className="text-sm font-medium">Dados adicionais</label>
            <div className="mt-1 rounded bg-gray-100 p-3 text-sm dark:bg-gray-800">
              <pre className="max-h-64 overflow-auto text-xs">{formatDataJson(request.data)}</pre>
            </div>
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium">Status atual</label>
          <div className="mt-1">
            <RequestStatusBadge status={request.status} />
          </div>
        </div>

        {request.response ? (
          <div>
            <label className="text-sm font-medium">Resposta anterior</label>
            <div className="mt-1 rounded bg-gray-100 p-3 text-sm dark:bg-gray-800">
              {request.response}
            </div>
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium">Resposta</label>
          <Textarea
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Digite sua resposta ou observação..."
            className="mt-1"
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onSendMessage()}
            disabled={anyBusy || !hasNewMessage}
            className="order-2 w-full sm:order-1 sm:w-auto"
          >
            {sendingMessage ? "Enviando…" : "Enviar mensagem"}
          </Button>
          <div className="order-1 flex w-full flex-wrap justify-stretch gap-2 sm:order-2 sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onUpdateStatus("IN_PROGRESS")}
              disabled={anyBusy}
              className="min-w-0 flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 sm:flex-none"
            >
              {updatingStatus ? "Atualizando…" : "Em andamento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onUpdateStatus("REJECTED")}
              disabled={anyBusy}
              className="min-w-0 flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 sm:flex-none"
            >
              {updatingStatus ? "Rejeitando…" : "Rejeitar"}
            </Button>
            <Button
              type="button"
              onClick={() => onUpdateStatus("APPROVED")}
              disabled={anyBusy}
              className="min-w-0 flex-1 bg-green-500 text-white hover:bg-green-600 sm:flex-none"
            >
              {updatingStatus ? "Aprovando…" : "Aprovar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
