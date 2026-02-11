"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalida o cache do roadmap de um curso
 * Pode ser chamada do cliente para forçar atualização
 */
export async function revalidateRoadmapCache(courseId: string): Promise<void> {
  try {
    revalidateTag(`roadmap-${courseId}`);
    revalidateTag(`modules-progress-${courseId}`);
  } catch (error) {
    console.warn("Erro ao revalidar cache do roadmap:", error);
  }
}

