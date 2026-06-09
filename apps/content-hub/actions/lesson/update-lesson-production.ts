"use server";

import { buildApiHeaders } from "@/actions/auth";
import type {
  LessonProductionItem,
  LessonProductionPriority,
  LessonProductionStatus,
} from "./get-lesson-production-by-course";

export type UpdateLessonProductionInput = {
  status?: LessonProductionStatus;
  notes?: string | null;
  priority?: LessonProductionPriority;
};

export async function updateLessonProduction(
  lessonId: number,
  input: UpdateLessonProductionInput,
  token?: string
): Promise<{ item: LessonProductionItem }> {
  const body: Record<string, unknown> = {};
  if (input.status !== undefined) body.status = input.status;
  if (input.notes !== undefined) body.notes = input.notes;
  if (input.priority !== undefined) body.priority = input.priority;

  if (Object.keys(body).length === 0) {
    throw new Error("Nada para atualizar");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/production`,
    {
      method: "PATCH",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const notesIssue = data.issues?.notes?._errors?.[0];
    const message =
      data.message === "Invalid body" && notesIssue
        ? notesIssue
        : (data.message ?? "Erro ao atualizar status editorial da aula");
    throw new Error(message);
  }
  return data as { item: LessonProductionItem };
}
