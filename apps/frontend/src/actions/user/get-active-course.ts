"use server";

import { getAuthToken } from "../auth/session";
import type {
  ActiveCourseResponse,
  ActiveCourse,
} from "@/types/user-course.ts";

/**
 * Busca o curso ativo do usuário logado
 */
export async function getActiveCourse(): Promise<ActiveCourse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account/active-course`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Cache com revalidação a cada 30 segundos (curso ativo pode mudar)
        next: {
          revalidate: 30,
          tags: ["active-course"],
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Curso ativo não encontrado");
        return null;
      }

      if (response.status === 401) {
        console.error("Não autorizado");
        return null;
      }

      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: ActiveCourseResponse = await response.json();
    return data.course;
  } catch (error) {
    console.error("Erro ao buscar curso ativo:", error);
    return null;
  }
}
