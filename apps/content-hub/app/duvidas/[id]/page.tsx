"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  createDuvidaAnswer,
  getDuvida,
  type ForumQuestionDetail,
} from "@/actions/duvidas";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-ch-border px-3 text-sm font-medium text-ch transition-colors hover:bg-ch-surface-raised";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DuvidaDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [question, setQuestion] = useState<ForumQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { question: data, message } = await getDuvida(id, token);
    if (!data) {
      toast.error(message || "Dúvida não encontrada");
      setQuestion(null);
    } else {
      setQuestion(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (!question) return;
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Digite uma resposta antes de enviar.");
      return;
    }
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createDuvidaAnswer(question.id, trimmed, token);
      if (result.success) {
        toast.success("Resposta enviada.");
        setBody("");
        await load();
      } else {
        toast.error(result.message || "Erro ao enviar resposta");
      }
    } catch {
      toast.error("Erro ao enviar resposta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/duvidas" className={outlineLinkClass}>
            ← Voltar à lista
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ch-muted">Carregando…</div>
        ) : question ? (
          <Card className="w-full max-w-3xl">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <CardTitle>Dúvida do aluno</CardTitle>
                <p className="text-sm text-ch-muted">
                  {question.author.name} · {formatDate(question.createdAt)}
                </p>
              </div>
              {question.status === "ANSWERED" ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Respondida
                </Badge>
              ) : (
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  Aguardando
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Curso</label>
                <div className="mt-1 text-sm">
                  {question.course?.title ?? "Geral"}
                  {question.lesson ? ` · ${question.lesson.title}` : ""}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Pergunta</label>
                <div className="mt-1 whitespace-pre-wrap rounded-md border border-ch-border bg-ch-surface-raised p-3 text-sm">
                  {question.body}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Respostas ({question.answers.length})
                </label>
                {question.answers.length === 0 ? (
                  <p className="mt-2 text-sm text-ch-muted">
                    Nenhuma resposta ainda.
                  </p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {question.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="rounded-md border border-ch-border p-3"
                      >
                        <div className="mb-2 flex justify-between gap-2 text-xs text-ch-muted">
                          <span className="font-medium text-ch">
                            {answer.author.name}
                          </span>
                          <span>{formatDate(answer.createdAt)}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {answer.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-ch-border pt-4">
                <label className="text-sm font-medium" htmlFor="tutor-reply">
                  Responder como tutor
                </label>
                <Textarea
                  id="tutor-reply"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escreva a resposta para o aluno. Pode incluir trechos de código com ```."
                  rows={6}
                />
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar resposta"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-ch-muted">
            Não foi possível carregar esta dúvida.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
