"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Desbloqueia o próximo módulo do curso
 */
export async function unlockNextModule(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return { success: false, error: "Token de autenticação não encontrado" };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules/unlock-next`,
      {
        method: "POST",
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
        console.error("Curso não encontrado");
        return { success: false, error: "Curso não encontrado" };
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Não é possível desbloquear o próximo módulo",
        };
      }

      console.error("Erro na resposta da API:", response.statusText);
      return { success: false, error: response.statusText };
    }

    // Invalida o cache após desbloquear o módulo
    try {
      // Invalida o cache do roadmap para atualizar a trilha instantaneamente
      revalidateTag(`roadmap-${courseId}`);
      // Invalida o cache dos módulos com progresso
      revalidateTag(`modules-progress-${courseId}`);
      // Revalida a página do learn e sections para forçar atualização
      revalidatePath("/learn", "page");
      revalidatePath("/learn/sections", "page");
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache do roadmap:", cacheError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao desbloquear próximo módulo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}


