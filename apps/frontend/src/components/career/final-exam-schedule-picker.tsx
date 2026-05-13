"use client";

import { useMemo, useState } from "react";
import { format, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  buildFinalExamSlotMap,
  canGoToNextMonth,
  canGoToPreviousMonth,
  firstMonthContainingSlots,
  getCalendarGridDays,
  shiftMonth,
  type FinalExamSlotOption,
} from "@/lib/final-exam-available-slots";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

export type FinalExamSchedulePickerProps = {
  /** Chamado quando o horário completo (data + hora) muda. */
  onSlotChange: (iso: string | null) => void;
};

export function FinalExamSchedulePicker({ onSlotChange }: FinalExamSchedulePickerProps) {
  const slotMap = useMemo(() => buildFinalExamSlotMap(), []);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    firstMonthContainingSlots(slotMap)
  );
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const gridDays = useMemo(() => getCalendarGridDays(visibleMonth), [visibleMonth]);

  const timesForDay: FinalExamSlotOption[] = dateKey ? slotMap.get(dateKey) ?? [] : [];

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/60">
        Escolha um dia útil e um horário entre as opções disponíveis (intervalo de 1 hora).
      </p>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-white/80 hover:text-white"
          disabled={!canGoToPreviousMonth(visibleMonth, slotMap)}
          onClick={() => setVisibleMonth((m) => shiftMonth(m, -1))}
          aria-label="Mês anterior"
        >
          <CaretLeft className="h-5 w-5" weight="bold" />
        </Button>
        <span className="text-sm font-semibold capitalize text-white">
          {format(visibleMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-white/80 hover:text-white"
          disabled={!canGoToNextMonth(visibleMonth, slotMap)}
          onClick={() => setVisibleMonth((m) => shiftMonth(m, 1))}
          aria-label="Próximo mês"
        >
          <CaretRight className="h-5 w-5" weight="bold" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-white/45">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, visibleMonth);
          const slots = slotMap.get(key);
          const hasSlots = Boolean(slots?.length);
          const isSelectedDay = dateKey === key || (selectedIso && format(new Date(selectedIso), "yyyy-MM-dd") === key);

          return (
            <button
              key={key}
              type="button"
              disabled={!hasSlots}
              onClick={() => {
                if (!hasSlots) return;
                setDateKey(key);
                setSelectedIso(null);
                onSlotChange(null);
              }}
              className={cn(
                "aspect-square max-h-9 rounded-md text-sm transition-colors",
                !inMonth && "text-white/25",
                inMonth && !hasSlots && "cursor-not-allowed text-white/25",
                inMonth && hasSlots && "text-white/90 hover:bg-white/10",
                isSelectedDay && hasSlots && "bg-[#00C8FF]/25 text-white ring-1 ring-[#00C8FF]/50"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="final-exam-time" className="text-sm text-white/80 block">
          Horário
        </label>
        <select
          id="final-exam-time"
          disabled={!dateKey || timesForDay.length === 0}
          value={selectedIso ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            const iso = v || null;
            setSelectedIso(iso);
            onSlotChange(iso);
          }}
          className={cn(
            "flex h-10 w-full rounded-md border border-[#333] bg-[#141418] px-3 py-2 text-sm text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8FF]/40",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <option value="">
            {!dateKey ? "Selecione um dia" : "Selecione o horário"}
          </option>
          {timesForDay.map((t) => (
            <option key={t.iso} value={t.iso}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
