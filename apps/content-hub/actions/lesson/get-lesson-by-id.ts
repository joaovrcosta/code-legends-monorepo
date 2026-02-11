"use server";

import type { LessonDetail } from "./get-lesson-by-slug";

export interface LessonResponse {
  lesson: LessonDetail;
}

/**
 * Busca uma aula pelo ID com todos os detalhes (author, submodule, etc.)
 */
export async function getLessonById(id: string | number, token: string): Promise<LessonDetail | null> {
  if (!id) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar aula");
    }

    const data: LessonResponse = await response.json();
    return data.lesson;
  } catch (error) {
    console.error("Erro ao buscar aula por ID:", error);
    return null;
  }
}
