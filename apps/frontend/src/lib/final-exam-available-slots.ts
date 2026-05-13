import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/** Regras de disponibilidade (horário local do utilizador). Ajuste aqui se a equipe mudar a grade. */
export const FINAL_EXAM_BOOKING = {
  startHour: 9,
  /** Último slot de 1h começa às 17h (termina 18h) */
  endHourExclusive: 18,
  skipHours: [12, 13] as const,
  weeksAhead: 8,
} as const;

export type FinalExamSlotOption = { iso: string; label: string };

function hourIsBookable(h: number) {
  if (h < FINAL_EXAM_BOOKING.startHour || h >= FINAL_EXAM_BOOKING.endHourExclusive) {
    return false;
  }
  return !(FINAL_EXAM_BOOKING.skipHours as readonly number[]).includes(h);
}

export function buildFinalExamSlotMap(now = new Date()): Map<string, FinalExamSlotOption[]> {
  const today = startOfDay(now);
  const lastDay = addDays(today, FINAL_EXAM_BOOKING.weeksAhead * 7);
  const map = new Map<string, FinalExamSlotOption[]>();

  for (let d = new Date(today); d <= lastDay; d = addDays(d, 1)) {
    if (isWeekend(d)) continue;
    const key = format(d, "yyyy-MM-dd");
    const slots: FinalExamSlotOption[] = [];
    for (let h = FINAL_EXAM_BOOKING.startHour; h < FINAL_EXAM_BOOKING.endHourExclusive; h++) {
      if (!hourIsBookable(h)) continue;
      const slotStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, 0, 0, 0);
      if (slotStart.getTime() <= now.getTime()) continue;
      slots.push({
        iso: slotStart.toISOString(),
        label: format(slotStart, "HH:mm"),
      });
    }
    if (slots.length) map.set(key, slots);
  }
  return map;
}

export function firstMonthContainingSlots(slotMap: Map<string, FinalExamSlotOption[]>): Date {
  const keys = [...slotMap.keys()].sort();
  if (keys.length === 0) return startOfMonth(new Date());
  const [y, m] = keys[0].split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function lastMonthContainingSlots(slotMap: Map<string, FinalExamSlotOption[]>): Date {
  const keys = [...slotMap.keys()].sort();
  if (keys.length === 0) return startOfMonth(new Date());
  const last = keys[keys.length - 1];
  const [y, m] = last.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

/** Dias exibidos no grid (semana começa na segunda). */
export function getCalendarGridDays(month: Date): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function canGoToPreviousMonth(
  month: Date,
  slotMap: Map<string, FinalExamSlotOption[]>
): boolean {
  const first = firstMonthContainingSlots(slotMap);
  return startOfMonth(month).getTime() > startOfMonth(first).getTime();
}

export function canGoToNextMonth(
  month: Date,
  slotMap: Map<string, FinalExamSlotOption[]>
): boolean {
  const last = lastMonthContainingSlots(slotMap);
  return startOfMonth(month).getTime() < startOfMonth(last).getTime();
}

export function shiftMonth(month: Date, delta: number): Date {
  return startOfMonth(addMonths(month, delta));
}
