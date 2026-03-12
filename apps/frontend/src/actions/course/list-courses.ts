"use server";

import { getAuthToken } from "../auth/session";
import type { CourseDTO } from "@code-legends/shared-types";
import type { CoursesListResponse } from "@/types/user-course.ts";
import { getUserEnrolledList } from "@/actions/progress";

export async function listCourses(): Promise<CoursesListResponse> {
  try {
    const token = await getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { courses: [] };
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

    // Busca lista de cursos em que o usuário está inscrito, com progresso
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
    console.error("Erro ao listar cursos:", error);
    return { courses: [] };
  }
}
