import type { CourseDTO } from "@code-legends/shared-types";
import type { CoursesListResponse } from "@/types/user-course.ts";
import { getUserEnrolledList } from "@/actions/progress";
import { getAuthToken } from "../auth/session";

/**
 * Busca cursos por termo de pesquisa, enriquecendo com isEnrolled e progress.
 */
export async function searchCourses(
  query: string
): Promise<CoursesListResponse> {
  if (!query || query.trim().length === 0) {
    return { courses: [] };
  }

  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/search?q=${encodeURIComponent(
        query
      )}`,
      {
        next: { revalidate: 60 }, // cache de 1min
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar cursos");
    }

    const raw: { courses: CourseDTO[] } = await response.json();

    if (!token) {
      return {
        courses: raw.courses.map((course) => ({
          ...course,
          isEnrolled: false,
          progress: 0,
        })),
      };
    }

    const { userCourses } = await getUserEnrolledList();
    const progressByCourseId = new Map(
      userCourses.map((enrolled) => [enrolled.courseId, enrolled.progress]),
    );

    const coursesWithUserData = raw.courses.map((course) => {
      const progress = progressByCourseId.get(course.id) ?? 0;

      return {
        ...course,
        isEnrolled: progressByCourseId.has(course.id),
        progress,
      };
    });

    return { courses: coursesWithUserData };
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return { courses: [] };
  }
}
