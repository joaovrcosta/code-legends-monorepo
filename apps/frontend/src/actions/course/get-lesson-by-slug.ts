"use server";

import { getAuthToken } from "../auth/session";
import type {
  LessonBySlugResult,
  LessonResponse,
} from "./lesson-by-slug-shared";

/**
 * Busca uma aula específica pelo slug do curso e slug da aula.
 * moduleSlug: quando há aulas com mesmo slug em módulos diferentes (ex: "Aula 1"), desambigua pelo módulo.
 * Em 403 (conteúdo exclusivo), retorna { __upgradeRequired: true, message } para a página exibir o paywall.
 */
export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string,
  moduleSlug?: string
): Promise<LessonBySlugResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return null;
    }

    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/lessons/${lessonSlug}`
    );
    if (moduleSlug) {
      url.searchParams.set("moduleSlug", moduleSlug);
    }
    const response = await fetch(
      url.toString(),
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
        return { __apiNotFound: true };
      }

      if (response.status === 403) {
        const body = await response.json().catch(() => ({}));
        const message =
          (body as { message?: string }).message ||
          "Conteúdo exclusivo para assinantes. Faça upgrade para acessar.";
        return { __upgradeRequired: true, message };
      }

      return null;
    }

    const data: LessonResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar aula:", error);
    return null;
  }
}
