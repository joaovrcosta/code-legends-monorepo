"use server";

import { getAuthToken } from "../auth/session";
import type { Lesson } from "@/types/roadmap";

export interface LessonResponse {
  lesson: Lesson;
  moduleTitle: string;
  groupTitle: string;
  status: "completed" | "unlocked" | "locked";
  isCurrent: boolean;
  canReview: boolean;
  module: {
    id: string;
    slug: string;
    title: string;
  };
  group: {
    id: number;
    slug?: string;
    title: string;
  };
  navigation?: {
    previous?: {
      slug: string;
      title: string;
      moduleSlug: string;
      groupSlug: string;
    };
    next?: {
      slug: string;
      title: string;
      moduleSlug: string;
      groupSlug: string;
    };
  };
}

/**
 * Busca uma aula específica pelo slug do curso e slug da aula
 */
export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string
): Promise<LessonResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/lessons/${lessonSlug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Sem cache para sempre ter dados atualizados
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Aula não encontrada");
        return null;
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: LessonResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar aula:", error);
    return null;
  }
}

