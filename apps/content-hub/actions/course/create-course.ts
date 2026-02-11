"use server";

import type { Course } from "./list-courses";

export interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  level: string;
  instructorId: string;
  categoryId?: string;
  thumbnail?: string;
  icon?: string;
  colorHex?: string;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: string;
}

export interface CreateCourseResponse {
  course: Course;
}

/**
 * Cria um novo curso
 */
export async function createCourse(
  courseData: CreateCourseData,
  token: string
): Promise<CreateCourseResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar curso");
    }

    const data: CreateCourseResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao criar curso");
  }
}

