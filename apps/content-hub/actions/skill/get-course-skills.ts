"use server";

export interface CourseSkillConfigItem {
  skillId: string;
  name: string;
  slug: string;
  description?: string | null;
  weight: number;
}

export interface CourseSkillsConfigResponse {
  courseId: string;
  skills: CourseSkillConfigItem[];
}

export async function getCourseSkillsConfig(
  courseId: string,
  token?: string
): Promise<CourseSkillsConfigResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/skills-config`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Erro na resposta da API ao buscar configuração de skills do curso:",
        response.statusText
      );
      return null;
    }

    const data: CourseSkillsConfigResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar configuração de skills do curso:", error);
    return null;
  }
}

export async function updateCourseSkillsConfig(
  courseId: string,
  skills: Array<{ skillId: string; weight: number }>,
  token: string
): Promise<CourseSkillsConfigResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/skills-config`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills }),
      }
    );

    if (!response.ok) {
      console.error(
        "Erro ao atualizar configuração de skills do curso:",
        response.statusText
      );
      return null;
    }

    const data: CourseSkillsConfigResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar configuração de skills do curso:", error);
    return null;
  }
}

