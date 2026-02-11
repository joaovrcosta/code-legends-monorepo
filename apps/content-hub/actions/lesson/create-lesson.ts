"use server";

import type { Lesson } from "./list-lessons";

export interface CreateLessonData {
  title: string;
  description: string;
  type: string;
  slug: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  locked?: boolean;
  order?: number;
}

export interface CreateLessonResponse {
  lesson: Lesson;
}

/**
 * Cria uma nova aula
 */
export async function createLesson(
  groupId: number,
  lessonData: CreateLessonData,
  token: string
): Promise<CreateLessonResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar aula");
    }

    const data: CreateLessonResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao criar aula");
  }
}

