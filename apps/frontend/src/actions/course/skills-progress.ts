"use server";

import { getAuthToken } from "../auth/session";

export interface CourseSkillProgressItem {
  skillId: string;
  name: string;
  slug: string;
  weight: number;
  totalXp: number;
  gainedXpInModule?: number;
  previousXp?: number;
}

export interface CourseSkillsProgressResponse {
  courseId: string;
  skills: CourseSkillProgressItem[];
  xpGainedInModule?: number;
  axisMax?: number;
  topSkills?: CourseSkillProgressItem[];
}

export async function getCourseSkillsProgress(
  courseId: string,
  moduleId?: string
): Promise<CourseSkillsProgressResponse | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error(
        "Token de autenticação não encontrado ao buscar skills do curso"
      );
      return null;
    }

    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/skills-progress`
    );
    if (moduleId) {
      url.searchParams.set("moduleId", moduleId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Erro ao buscar progresso de skills do curso:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data: CourseSkillsProgressResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar progresso de skills do curso:", error);
    return null;
  }
}

