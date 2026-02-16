"use server";

import type { Course } from "./list-courses";

export interface CourseResponse {
  course: Course;
}

/**
 * Busca um curso pelo slug
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!slug) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar curso");
    }

    const data: CourseResponse = await response.json();
    return data.course;
  } catch (error) {
    console.error("Erro ao buscar curso por slug:", error);
    return null;
  }
}

/**
 * Busca um curso pelo ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  if (!id) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/by-id/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar curso");
    }

    const data: CourseResponse = await response.json();
    return data.course;
  } catch (error) {
    console.error("Erro ao buscar curso por ID:", error);
    return null;
  }
}

