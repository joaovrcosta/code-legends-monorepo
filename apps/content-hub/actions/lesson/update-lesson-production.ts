"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { LessonProductionItem, LessonProductionStatus } from "./get-lesson-production-by-course";

export async function updateLessonProduction(
  lessonId: number,
  input: { status: LessonProductionStatus; notes?: string },
  token?: string
): Promise<{ item: LessonProductionItem }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/production`,
    {
      method: "PATCH",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
      body: JSON.stringify(input),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Erro ao atualizar status editorial da aula");
  }
  return data as { item: LessonProductionItem };
}

