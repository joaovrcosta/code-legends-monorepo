"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";
import { getActiveCourse } from "../user/get-active-course";

/**
 * Marca a lição atual como concluída e avança para a próxima
 */
export async function continueCourse(
  lessonId: number,
  courseId?: string
): Promise<{ success: boolean }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/complete`,
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
      if (response.status === 404) {
        console.error("Lição não encontrada");
        throw new Error("Lição não encontrada");
      }

      if (response.status === 401) {
        console.error("Não autorizado");
        throw new Error("Não autorizado");
      }

      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta da API:", errorData);
      throw new Error(
        errorData.message || "Erro ao marcar lição como completa"
      );
    }

    // Invalida o cache do roadmap após marcar a lição como completa
    try {
      // Se courseId não foi fornecido, busca o curso ativo
      const activeCourseId = courseId || (await getActiveCourse())?.id;
      
      if (activeCourseId) {
        // Invalida o cache do roadmap usando a tag
        revalidateTag(`roadmap-${activeCourseId}`);
        // Também revalida a página do learn para forçar atualização
        revalidatePath("/learn", "page");
      }
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache do roadmap:", cacheError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao continuar curso:", error);
    throw error instanceof Error ? error : new Error("Erro ao continuar curso");
  }
}
