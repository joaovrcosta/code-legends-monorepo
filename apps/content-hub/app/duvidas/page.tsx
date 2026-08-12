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
import { Badge } from "@/components/ui/badge";
import {
  listDuvidas,
  type ForumQuestionListItem,
  type ForumQuestionStatus,
} from "@/actions/duvidas";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-ch-border px-3 text-sm font-medium text-ch transition-colors hover:bg-ch-surface-raised";

const filterBtnClass =
  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors border border-ch-border";

function StatusBadge({ status }: { status: ForumQuestionStatus }) {
  if (status === "ANSWERED") {
    return (
      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
        Respondida
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
      Aguardando
    </Badge>
  );
}

export default function DuvidasPage() {
  const [questions, setQuestions] = useState<ForumQuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    ForumQuestionStatus | "ALL"
  >("ALL");

  useEffect(() => {
    void loadQuestions();
  }, [statusFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      const data = await listDuvidas(token, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setQuestions(data);
    } catch (error) {
      console.error("Erro ao carregar dúvidas:", error);
      toast.error("Erro ao carregar dúvidas");
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
          <h1 className="text-3xl font-bold text-ch">Dúvidas</h1>
          <p className="mt-2 text-ch-muted">
            Responda às dúvidas enviadas pelos alunos
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ALL", "Todas"],
              ["WAITING_ANSWER", "Aguardando"],
              ["ANSWERED", "Respondidas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${filterBtnClass} ${
                statusFilter === value
                  ? "bg-ch-surface-raised text-ch"
                  : "text-ch-muted hover:bg-ch-surface-raised"
              }`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-ch-muted">Carregando...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Dúvidas ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="py-8 text-center text-ch-muted">
                  Nenhuma dúvida encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Dúvida</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <div className="font-medium">
                            {question.author?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {question.course?.title ?? "Geral"}
                          </span>
                          {question.lesson ? (
                            <div className="text-xs text-ch-muted truncate max-w-[160px]">
                              {question.lesson.title}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {question.preview || question.body}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={question.status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(question.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/duvidas/${question.id}`}
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
