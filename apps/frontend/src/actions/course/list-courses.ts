"use server";

import { getAuthToken } from "../auth/session";
import type { CoursesListResponse } from "@/types/user-course.ts";

/**
 * Lista todos os cursos disponíveis na plataforma
 */
export async function listCourses(): Promise<CoursesListResponse> {
  try {
    const token = await getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Adiciona token se disponível (pode ser útil para cursos premium)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { courses: [] };
    }

    const data: CoursesListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    return { courses: [] };
  }
}
