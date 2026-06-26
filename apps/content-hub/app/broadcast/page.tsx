"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";
import { sendBroadcastNotification, NotificationType, TargetPlan } from "@/actions/settings/broadcast";
import { Megaphone, Users, Send } from "lucide-react";

const notificationTypeLabels: Record<NotificationType, string> = {
  NEW_COURSE_AVAILABLE: "Novo Curso Disponível",
  CERTIFICATE_GENERATED: "Certificado Gerado",
  LEVEL_UP: "Subiu de Nível",
  REQUEST_STATUS_CHANGED: "Status de Solicitação Alterado",
  COURSE_COMPLETED: "Curso Concluído",
  NEW_EVENT: "Novo Evento",
};

const planLabels: Record<TargetPlan, string> = {
  ALL: "Todos os Usuários",
  FREE: "Plano Free",
  PRO: "Plano Pro",
  PREMIUM: "Plano Premium",
};

export default function BroadcastPage() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "NEW_COURSE_AVAILABLE" as NotificationType,
    targetPlan: "ALL" as TargetPlan,
  });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ notificationsSent: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }

    if (!confirm(`Você tem certeza? Isso enviará notificações para todos os usuários do segmento: "${planLabels[form.targetPlan]}".`)) return;

    try {
      setSending(true);
      const token = getAuthTokenFromClient();
      if (!token) return;

      const result = await sendBroadcastNotification(token, form);
      setLastResult(result);
      toast.success(`Broadcast enviado! ${result.notificationsSent} notificações criadas.`);
      setForm({ ...form, title: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-ch-accent" />
          <div>
            <h1 className="text-3xl font-bold text-ch">Broadcaster</h1>
            <p className="mt-1 text-ch-muted">
              Envie notificações em massa para segmentos de usuários da plataforma.
            </p>
          </div>
        </div>

        {lastResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <p className="font-medium text-green-800 dark:text-green-300">
              ✅ Último broadcast enviado com sucesso para{" "}
              <strong>{lastResult.notificationsSent}</strong> usuário(s).
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Compor Mensagem</CardTitle>
            <CardDescription>
              Preencha os campos abaixo e selecione o segmento de usuários que receberão a notificação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPlan">
                    <Users className="mr-1 inline h-3.5 w-3.5" />
                    Público-Alvo
                  </Label>
                  <select
                    id="targetPlan"
                    value={form.targetPlan}
                    onChange={(e) => setForm({ ...form, targetPlan: e.target.value as TargetPlan })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {Object.entries(planLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Notificação</Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {Object.entries(notificationTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Novo curso de React disponível!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Escreva a mensagem que será enviada aos usuários..."
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={sending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {sending ? "Enviando..." : "Enviar Broadcast"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
