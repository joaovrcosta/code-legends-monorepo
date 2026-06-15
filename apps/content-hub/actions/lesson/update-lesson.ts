"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Lesson, Challenge } from "./list-lessons";

export interface UpdateLessonData {
  title?: string;
  description?: string;
  type?: string;
  slug?: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  video_provider_id?: string;
  body?: string;
  quiz_content?: Challenge[];
  project_description?: string;
  project_specs?: unknown;
  locked?: boolean;
  order?: number;
  authorId?: string;
  submoduleId?: number;
}

export interface UpdateLessonResponse {
  lesson: Lesson;
  videoWarnings?: string[];
}

/**
 * Atualiza uma aula
 */
export async function updateLesson(
  id: string,
  lessonData: UpdateLessonData,
  token: string
): Promise<UpdateLessonResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${id}`,
      {
        method: "PUT",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify(lessonData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar aula");
    }

    const data: UpdateLessonResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar aula");
  }
}

