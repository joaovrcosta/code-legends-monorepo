"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Reseta o progresso de um curso específico
 * Outros cursos do aluno não são afetados
 */
export async function resetCourseProgress(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return { success: false, error: "Token de autenticação não encontrado" };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/reset-progress`,
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

      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta da API:", response.statusText);
      return {
        success: false,
        error: errorData.message || response.statusText,
      };
    }

    // Invalida o cache após resetar o progresso
    try {
      // Invalida o cache do roadmap do curso
      revalidateTag(`roadmap-${courseId}`);
      // Invalida o cache dos módulos com progresso
      revalidateTag(`modules-progress-${courseId}`);
      // Invalida o cache dos cursos inscritos
      revalidateTag("user-enrolled-courses");
      // Revalida a página do learn para forçar atualização
      revalidatePath("/learn", "page");
      // Revalida a página do curso também
      revalidatePath(`/cursos/${courseId}`, "page");
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache:", cacheError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar progresso do curso:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}


