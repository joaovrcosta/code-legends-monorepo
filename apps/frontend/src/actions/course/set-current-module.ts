"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Atualiza o módulo atual do aluno no roadmap
 */
export async function setCurrentModule(
  courseId: string,
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return { success: false, error: "Token de autenticação não encontrado" };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules/${moduleId}/current`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Não autorizado");
        return { success: false, error: "Não autorizado" };
      }

      if (response.status === 404) {
        console.error("Curso ou módulo não encontrado");
        return { success: false, error: "Curso ou módulo não encontrado" };
      }

      console.error("Erro na resposta da API:", response.statusText);
      return { success: false, error: response.statusText };
    }

    // Invalida o cache após atualizar o módulo atual
    try {
      // Invalida o cache do roadmap para atualizar a trilha instantaneamente
      revalidateTag(`roadmap-${courseId}`);
      // Invalida o cache dos módulos com progresso
      revalidateTag(`modules-progress-${courseId}`);
      // Revalida a página do learn para forçar atualização
      revalidatePath("/learn", "page");
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache do roadmap:", cacheError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar módulo atual:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
