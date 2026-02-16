"use server";

import { getAuthToken } from "../auth/session";
import type { RoadmapResponse } from "@/types/roadmap";

/**
 * Busca o roadmap de um curso com cache (revalida a cada 60 segundos)
 * O cache é automático do Next.js quando usado em Server Components
 */
export async function getCourseRoadmap(
  courseId: string
): Promise<RoadmapResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/roadmap`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Cache com revalidação a cada 60 segundos
        // O Next.js automaticamente cacheia por usuário/sessão
        next: {
          revalidate: 60, // Revalida a cada 60 segundos
          tags: [`roadmap-${courseId}`],
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Roadmap não encontrado");
        return null;
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: RoadmapResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar roadmap:", error);
    return null;
  }
}

/**
 * Busca o roadmap de um curso SEM cache (para uso após ações que alteram o estado)
 * Use esta função quando precisar de dados atualizados imediatamente
 */
export async function getCourseRoadmapFresh(
  courseId: string
): Promise<RoadmapResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/roadmap`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // SEM cache - sempre busca dados frescos
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Roadmap não encontrado");
        return null;
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: RoadmapResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar roadmap:", error);
    return null;
  }
}
