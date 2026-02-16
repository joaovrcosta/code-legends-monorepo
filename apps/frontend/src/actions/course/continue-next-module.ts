"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";

interface ContinueNextModuleResponse {
  message: string;
  userCourse: {
    id: string;
    currentModuleId: string;
    currentTaskId: number | null;
  };
  nextModuleId: string;
  wasUnlocked: boolean;
}

/**
 * Avança para o próximo módulo, desbloqueando se necessário e continuando na primeira lição não completada
 */
export async function continueNextModule(
  courseId: string
): Promise<{ success: boolean; data?: ContinueNextModuleResponse; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return { success: false, error: "Token de autenticação não encontrado" };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules/continue-next`,
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

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Não é possível avançar para o próximo módulo. Complete o módulo atual primeiro.",
        };
      }

      if (response.status === 404) {
        console.error("Curso não encontrado");
        return { success: false, error: "Curso não encontrado" };
      }

      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta da API:", errorData);
      return {
        success: false,
        error: errorData.message || response.statusText,
      };
    }

    const data: ContinueNextModuleResponse = await response.json();

    // Invalida o cache após avançar para o próximo módulo
    try {
      revalidateTag(`roadmap-${courseId}`);
      revalidateTag(`modules-progress-${courseId}`);
      revalidatePath("/learn", "page");
    } catch (cacheError) {
      console.warn("Erro ao invalidar cache do roadmap:", cacheError);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao continuar para próximo módulo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

