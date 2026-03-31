"use server";

import { buildApiHeaders } from "@/actions/auth";

export interface LessonSkillConfigItem {
  skillId: string;
  name: string;
  slug: string;
  description?: string | null;
  weight: number;
}

export interface LessonSkillsConfigResponse {
  lessonId: number;
  skills: LessonSkillConfigItem[];
}

export async function getLessonSkillsConfig(
  lessonId: number,
  token?: string
): Promise<LessonSkillsConfigResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/skills-config`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Erro na resposta da API ao buscar configuração de skills da aula:",
        response.statusText
      );
      return null;
    }

    const data: LessonSkillsConfigResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar configuração de skills da aula:", error);
    return null;
  }
}

export async function updateLessonSkillsConfig(
  lessonId: number,
  skills: Array<{ skillId: string; weight: number }>,
  token: string
): Promise<LessonSkillsConfigResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/skills-config`,
      {
        method: "PUT",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify({ skills }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const details = Array.isArray(errorData?.invalidSkillIds)
        ? ` (skills inválidas: ${errorData.invalidSkillIds.join(", ")})`
        : "";
      throw new Error(
        `${errorData.message || "Erro ao atualizar skills da aula"}${details}`
      );
    }

    const data: LessonSkillsConfigResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar configuração de skills da aula:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar skills da aula");
  }
}

