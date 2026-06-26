"use client";

import { useEffect, useState } from "react";
import { getLessonProductionLogsByCourse, type LessonProductionLogItem } from "@/actions/lesson/get-lesson-production-logs-by-course";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function statusPt(status: string) {
  switch (status) {
    case "TODO":
      return "A fazer";
    case "IN_PROGRESS":
      return "Em produção";
    case "REVIEW":
      return "Em revisão";
    case "DONE":
      return "concluido";
    case "BLOCKED":
      return "bloqueado";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "DONE":
      return "text-emerald-300";
    case "BLOCKED":
      return "text-rose-300";
    case "REVIEW":
      return "text-violet-300";
    case "IN_PROGRESS":
      return "text-sky-300";
    case "TODO":
    default:
      return "text-zinc-400";
  }
}

function statusPillClass(status: string) {
  switch (status) {
    case "DONE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "BLOCKED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    case "REVIEW":
      return "border-violet-400/20 bg-violet-400/10 text-violet-200";
    case "IN_PROGRESS":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
    case "TODO":
    default:
      return "border-white/10 bg-white/5 text-zinc-200";
  }
}

/** Quantidade inicial e por página ao carregar mais. */
const LOG_PAGE_SIZE = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CourseProductionLogs({
  courseId,
  refreshKey,
  onEditLesson,
}: {
  courseId: string;
  refreshKey?: number;
  onEditLesson?: (lessonId: number) => void;
}) {
  const [items, setItems] = useState<LessonProductionLogItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (mode: "reset" | "more") => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) return;
      const res = await getLessonProductionLogsByCourse(
        courseId,
        { limit: LOG_PAGE_SIZE, cursor: mode === "more" ? cursor : null },
        token
      );
      setItems((prev) => (mode === "more" ? [...prev, ...res.items] : res.items));
      setCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, refreshKey]);

  return (
    <Card className="border-white/10 bg-white/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Atividades</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => load("reset")} disabled={loading}>
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-6 text-sm text-ch-muted">
            Nenhuma alteração registrada ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3"
              >
                <div className="shrink-0">
                  <div className="h-7 w-7 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {it.actorAvatar ? (
                      <img
                        src={it.actorAvatar}
                        alt={it.actorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] font-semibold text-zinc-300">
                        {it.actorName?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 text-sm text-zinc-200">
                  <span className="font-medium">{it.actorName}</span>{" "}
                  alterou{" "}
                  {onEditLesson ? (
                    <button
                      type="button"
                      onClick={() => onEditLesson(it.lessonId)}
                      className="font-semibold underline underline-offset-2 hover:opacity-90"
                      title="Editar aula"
                    >
                      {it.lessonTitle}
                    </button>
                  ) : (
                    <span className="font-semibold">{it.lessonTitle}</span>
                  )}{" "}
                  <span className="mx-1 text-zinc-400">de</span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      statusPillClass(it.fromStatus),
                    ].join(" ")}
                  >
                    {statusPt(it.fromStatus)}
                  </span>{" "}
                  <span className="mx-1 text-zinc-400">para</span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      statusPillClass(it.toStatus),
                    ].join(" ")}
                  >
                    {statusPt(it.toStatus)}
                  </span>
                  <span className="ml-2 text-[12px] text-zinc-500">
                    {formatDateTime(it.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => load("more")}
              disabled={loading || !cursor}
            >
              {loading
                ? "Carregando…"
                : cursor
                  ? "Listar mais"
                  : "Sem mais registros"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

