"use server";

import { buildApiHeaders } from "@/actions/auth";

export type CourseMetricsSummary = {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageProgress: number;
  favorites: number;
  certificates: number;
  courseLikes: number;
  courseDislikes: number;
  totalLessons: number;
  lessonsCompleted: number;
};

export type CourseLessonReaction = {
  lessonId: number;
  title: string;
  moduleTitle: string;
  groupTitle: string;
  likes: number;
  dislikes: number;
  ratingCount: number;
  averageRating: number | null;
};

export type CourseMetricsResponse = {
  summary: CourseMetricsSummary;
  lessonReactions: CourseLessonReaction[];
};

export async function getCourseMetrics(
  courseId: string,
  token?: string,
): Promise<CourseMetricsResponse | null> {
  if (!courseId) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/metrics`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "Erro ao buscar métricas do curso:",
        response.status,
        response.statusText,
      );
      return null;
    }

    return (await response.json()) as CourseMetricsResponse;
  } catch (error) {
    console.error("Erro ao buscar métricas do curso:", error);
    return null;
  }
}
