"use server";

import { buildApiHeaders } from "@/actions/auth";

export type LessonProductionStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED";

export type LessonProductionItem = {
  lessonId: number;
  status: LessonProductionStatus;
  notes: string | null;
  updatedAt: string;
  updatedById: string;
};

export async function getLessonProductionByCourse(
  courseId: string,
  token?: string
): Promise<{ items: LessonProductionItem[] }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/production?courseId=${encodeURIComponent(courseId)}`,
    {
      method: "GET",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "Erro ao carregar status editorial das aulas");
  }

  const data = (await response.json()) as { items: LessonProductionItem[] };
  return { items: Array.isArray(data.items) ? data.items : [] };
}

