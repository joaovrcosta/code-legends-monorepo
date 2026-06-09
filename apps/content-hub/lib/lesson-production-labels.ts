import type { LessonProductionStatus } from "@/actions/lesson/get-lesson-production-by-course";

/** Alinhado ao limite da API (`patch-lesson-production.controller.ts`). */
export const MAX_LESSON_PRODUCTION_NOTES_LENGTH = 50_000;

export const LESSON_PRODUCTION_STATUSES: LessonProductionStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BLOCKED",
];

export function lessonProductionStatusLabel(
  status: LessonProductionStatus,
): string {
  switch (status) {
    case "TODO":
      return "A fazer";
    case "IN_PROGRESS":
      return "Em produção";
    case "REVIEW":
      return "Em revisão";
    case "DONE":
      return "Feita";
    case "BLOCKED":
      return "Bloqueada";
    default:
      return status;
  }
}

export function normalizeLessonProductionStatus(
  raw: string | null | undefined,
): LessonProductionStatus {
  const s = raw as LessonProductionStatus | undefined;
  return s && LESSON_PRODUCTION_STATUSES.includes(s) ? s : "TODO";
}

export function validateLessonProductionNotesLength(notes: string): string | null {
  const trimmed = notes.trim();
  if (trimmed.length > MAX_LESSON_PRODUCTION_NOTES_LENGTH) {
    return `As anotações podem ter no máximo ${MAX_LESSON_PRODUCTION_NOTES_LENGTH.toLocaleString("pt-BR")} caracteres (atual: ${trimmed.length.toLocaleString("pt-BR")}).`;
  }
  return null;
}
