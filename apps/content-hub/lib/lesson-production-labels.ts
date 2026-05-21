import type { LessonProductionStatus } from "@/actions/lesson/get-lesson-production-by-course";

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
