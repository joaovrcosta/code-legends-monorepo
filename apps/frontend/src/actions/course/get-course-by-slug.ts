import type { CourseDetail, CourseDetailResponse } from "@/types/course-types";
import { getAuthToken } from "@/actions/auth/session";

/**
 * Busca um curso pelo slug
 */
export async function getCourseBySlug(
  slug: string
): Promise<CourseDetail | null> {
  if (!slug) return null;

  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${slug}`,
      {
        cache: "no-store",
        headers,
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar curso");
    }

    const data: CourseDetailResponse = await response.json();
    return data.course;
  } catch (error) {
    console.error("Erro ao buscar curso por slug:", error);
    return null;
  }
}
