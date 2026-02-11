"use server";

import { getAuthToken } from "../auth/session";

import type { ModulesWithProgressResponse } from "@/types/roadmap";

/**
 * Busca os módulos de um curso com informações de progresso
 * @param courseId - ID ou slug do curso
 * @param currentModule - ID do módulo atual (opcional) - se não fornecido, usa automaticamente o currentModuleId do userCourse
 */
export async function listModulesProgress(
  courseId: string,
  currentModule?: string
): Promise<ModulesWithProgressResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return null;
    }

    // Construir a URL com o parâmetro currentModule se fornecido
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules/with-progress`
    );
    
    if (currentModule) {
      url.searchParams.append("currentModule", currentModule);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Módulos não encontrados");
        return null;
      }

      if (response.status === 401) {
        console.error("Não autorizado");
        return null;
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: ModulesWithProgressResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Erro ao buscar módulos com progresso:", error);
    return null;
  }
}