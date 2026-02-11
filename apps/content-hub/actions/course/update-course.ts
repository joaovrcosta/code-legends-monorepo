"use server";

import type { Course } from "./list-courses";

export interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  instructorId?: string;
  categoryId?: string;
  thumbnail?: string;
  icon?: string;
  colorHex?: string;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: string;
}

export interface UpdateCourseResponse {
  course: Course;
}

/**
 * Atualiza um curso
 */
export async function updateCourse(
  id: string,
  courseData: UpdateCourseData,
  token: string
): Promise<UpdateCourseResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar curso");
    }

    const data: UpdateCourseResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar curso");
  }
}

