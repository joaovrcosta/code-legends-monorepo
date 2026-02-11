import type { CoursesListResponse } from "@/types/user-course.ts";

/**
 * Busca cursos por termo de pesquisa
 */
export async function searchCourses(
  query: string
): Promise<CoursesListResponse> {
  if (!query || query.trim().length === 0) {
    return { courses: [] };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/search?q=${encodeURIComponent(
        query
      )}`,
      {
        next: { revalidate: 60 }, // cache de 1min
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar cursos");
    }

    const data: CoursesListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return { courses: [] };
  }
}
