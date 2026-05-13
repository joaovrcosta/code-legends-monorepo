"use client";

import { useCallback, useState } from "react";
import { listCareerExamAttempts } from "@/actions/career/list-career-exam-attempts";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  careerSlug: string;
  examId: string;
  attemptCount: number;
};

export function CareerExamAttemptHistory({
  careerSlug,
  examId,
  attemptCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof listCareerExamAttempts>>["attempts"]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCareerExamAttempts(careerSlug, examId);
      setRows(data.attempts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [careerSlug, examId]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && rows.length === 0 && !loading) {
      await load();
    }
  };

  if (attemptCount === 0) {
    return (
      <p className="mt-2 text-[11px] text-white/45">Nenhuma tentativa registrada ainda.</p>
    );
  }

  return (
    <div className="mt-2 border-t border-white/10 pt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-[11px] text-[#00C8FF] hover:text-[#5ce1ff]"
        onClick={toggle}
      >
        Histórico de tentativas ({attemptCount})
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </Button>
      {open ? (
        <div className="mt-2 rounded-lg border border-[#25252A] bg-black/20 p-2 text-[11px]">
          {loading ? (
            <p className="text-white/50">Carregando…</p>
          ) : error ? (
            <p className="text-red-300">{error}</p>
          ) : (
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 border-b border-white/5 pb-1 last:border-0"
                >
                  <span className="text-white/70">
                    {new Date(r.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={r.passed ? "text-emerald-300" : "text-white/80"}>
                    {Math.round(r.score)}% {r.passed ? "— Aprovado" : "— Reprovado"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {rows.length > 0 ? (
          <p className="mt-2 text-[10px] text-white/40">
            Nota mínima: 70% e ≥ nota de corte do exame ({rows[0]?.passingScore ?? "—"}%).
          </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
