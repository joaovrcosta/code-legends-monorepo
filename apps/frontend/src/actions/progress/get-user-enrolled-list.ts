"use server";

import { getAuthToken } from "../auth/session";
import type { UserEnrolledListResponse } from "@/types/user-course.ts";

/**
 * Busca a lista de cursos nos quais o usuário está inscrito (enrolled)
 */
export async function getUserEnrolledList(): Promise<UserEnrolledListResponse> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return { userCourses: [] };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/enrolled`,
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
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Usuário não encontrado:", errorData.message);
        return { userCourses: [] };
      }

      if (response.status === 500) {
        console.error("Erro interno do servidor");
        throw new Error("Erro interno do servidor");
      }

      console.error("Erro na resposta da API:", response.statusText);
      return { userCourses: [] };
    }

    const data: UserEnrolledListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar cursos inscritos:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao buscar cursos inscritos");
  }
}
