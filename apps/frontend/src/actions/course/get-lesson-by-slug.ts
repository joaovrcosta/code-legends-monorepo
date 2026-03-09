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

/** Resposta quando a API retorna 403 (conteúdo exclusivo para assinantes). Não lança erro. */
export interface LessonUpgradeRequired {
  __upgradeRequired: true;
  message: string;
}

/**
 * Busca uma aula específica pelo slug do curso e slug da aula.
 * moduleSlug: quando há aulas com mesmo slug em módulos diferentes (ex: "Aula 1"), desambigua pelo módulo.
 * Em 403 (conteúdo exclusivo), retorna { __upgradeRequired: true, message } para a página exibir o paywall.
 */
export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string,
  moduleSlug?: string
): Promise<LessonResponse | LessonUpgradeRequired | null> {
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
        return null;
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

