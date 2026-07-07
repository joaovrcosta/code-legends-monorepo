"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getXpHistory, type XpHistoryRow } from "@/actions/user/get-xp-history";

type XpHistoryModalProps = {
  days?: number;
  limit?: number;
  triggerClassName?: string;
};

function formatRowDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function XpHistoryModal({
  days = 30,
  limit = 200,
  triggerClassName,
}: XpHistoryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<XpHistoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getXpHistory({ days, limit });
        if (cancelled) return;
        if (!res) {
          setRows([]);
          return;
        }
        setRows(res.rows ?? []);
      } catch {
        if (cancelled) return;
        setError("Não foi possível carregar os logs de XP.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (open && rows == null && !loading) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [open, rows, loading, days, limit]);

  const totalXp = useMemo(() => {
    if (!rows?.length) return 0;
    return rows.reduce((acc, r) => acc + (r.xpAmount ?? 0), 0);
  }, [rows]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        Ver logs de XP
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border-[#25252A]">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-white">
                Logs de XP (últimos {days} dias)
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-[#C4C4CC]">Carregando…</p>
            ) : error ? (
              <div className="rounded-lg border border-[#25252A] bg-[#141417] p-4">
                <p className="text-sm text-white font-semibold">{error}</p>
                <p className="text-xs text-[#7e7e89] mt-1">
                  Tente novamente em alguns instantes.
                </p>
              </div>
            ) : rows && rows.length === 0 ? (
              <div className="rounded-lg border border-[#25252A] bg-[#141417] p-4">
                <p className="text-sm text-[#C4C4CC]">
                  Nenhum log de XP encontrado nesse período.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#7e7e89] mb-3">
                  <span>Total no período</span>
                  <span className="font-semibold text-[#FF6200] tabular-nums">
                    {totalXp} xp
                  </span>
                </div>

                <div className="rounded-lg border border-[#25252A] overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto] gap-2 px-4 py-2 bg-[#141417] text-[11px] text-[#7e7e89]">
                    <span>Data</span>
                    <span>XP</span>
                  </div>
                  <ul className="divide-y divide-[#25252A]">
                    {(rows ?? [])
                      .slice()
                      .reverse()
                      .map((r, idx) => (
                        <li
                          key={`${r.createdAt}-${idx}`}
                          className="grid grid-cols-[1fr_auto] gap-2 px-4 py-3 bg-black/10"
                        >
                          <span className="text-sm text-[#C4C4CC]">
                            {formatRowDate(r.createdAt)}
                          </span>
                          <span className="text-sm font-semibold text-white tabular-nums">
                            {r.xpAmount} xp
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

