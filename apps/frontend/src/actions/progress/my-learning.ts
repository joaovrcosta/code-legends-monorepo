"use server";

import { getAuthToken } from "../auth/session";

export interface MyLearningCourse {
  id: string;
  title: string;
  icon: string;
  progress: number;
}

export interface MyLearningResponse {
  inProgress: MyLearningCourse[];
  completed: MyLearningCourse[];
}

/**
 * Busca os cursos do usuário (em progresso e completos)
 */
export async function getMyLearning(): Promise<MyLearningResponse> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return { inProgress: [], completed: [] };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/my-learning`,
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
        return { inProgress: [], completed: [] };
      }

      console.error("Erro na resposta da API:", response.statusText);
      return { inProgress: [], completed: [] };
    }

    const data: MyLearningResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar meu aprendizado:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao buscar meu aprendizado");
  }
}
