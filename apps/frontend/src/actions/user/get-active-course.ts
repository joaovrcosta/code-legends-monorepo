"use server";

import { cache } from "react";
import { getAuthToken } from "../auth/session";
import { getResolvedUserPlan } from "./get-user-from-api";
import { canAccessPathUnit } from "@/lib/user-plan";
import type {
  ActiveCourseResponse,
  ActiveCourse,
} from "@/types/user-course.ts";

/**
 * Busca o curso ativo do usuário logado.
 * Deduplicada por requisição via React.cache.
 */
export const getActiveCourse = cache(async function getActiveCourse(): Promise<ActiveCourse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
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
});

/** Curso ativo em "Trilha atual" — oculta PATH_UNIT para quem não é Premium. */
export const getDisplayActiveCourse = cache(async function getDisplayActiveCourse(): Promise<ActiveCourse | null> {
  const [activeCourse, userPlan] = await Promise.all([
    getActiveCourse(),
    getResolvedUserPlan(),
  ]);

  if (!activeCourse) {
    return null;
  }

  if (activeCourse.kind === "PATH_UNIT" && !canAccessPathUnit(userPlan)) {
    return null;
  }

  return activeCourse;
});
