"use server";

import { getAuthToken } from "../auth/session";
import type { CompletedCoursesResponse } from "@/types/user-course.ts";

/**
 * Busca os cursos completos do aluno
 */
export async function getCompletedCourses(): Promise<CompletedCoursesResponse> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return { courses: [] };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/completed`,
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
      console.error("Erro na resposta da API:", response.statusText);
      return { courses: [] };
    }

    const data: CompletedCoursesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar cursos completos:", error);
    return { courses: [] };
  }
}
