"use server";

import { getAuthToken } from "../auth/session";
import type { UserCourseProgressResponse } from "@/types/user-course.ts";

/**
 * Busca o progresso do curso do usuário pelo slug do curso
 * @param courseIdentifier - Slug do curso
 * @returns Progresso do curso ou null se não encontrado
 */
export async function getUserCourseProgress(
  courseIdentifier: string
): Promise<UserCourseProgressResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseIdentifier}/progress`,
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
        // Curso não encontrado
        return null;
      }

      if (response.status === 401) {
        // Não autorizado
        return null;
      }

      if (response.status === 403) {
        // Usuário não está inscrito no curso - comportamento esperado
        return null;
      }

      if (response.status === 500) {
        console.error("Erro interno do servidor");
        throw new Error("Erro interno do servidor");
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: UserCourseProgressResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar progresso do curso:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao buscar progresso do curso");
  }
}
