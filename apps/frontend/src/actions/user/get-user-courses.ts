"use server";

import { getAuthToken } from "../auth/session";

export async function getUserCourses() {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      return [];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/favorites`,
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
      return [];
    }

    const courses = await response.json();
    return courses;
  } catch (error) {
    console.error("Erro ao buscar cursos do usuário:", error);
    return [];
  }
}
