"use server";

export interface CourseSkillProgressItem {
  skillId: string;
  name: string;
  slug: string;
  weight: number;
  totalXp: number;
}

export interface CourseSkillsProgressResponse {
  courseId: string;
  skills: CourseSkillProgressItem[];
}

export async function getCourseSkillsProgress(
  courseId: string
): Promise<CourseSkillsProgressResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/skills-progress`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.error(
        "Erro ao buscar progresso de skills do curso:",
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

