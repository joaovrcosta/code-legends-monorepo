"use server";

import { getAuthTokenFromClient } from "@/lib/auth";

export interface PublishCourseResponse {
  course: {
    id: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
  };
}

/**
 * Publica um curso
 */
export async function publishCourse(
  courseId: string,
  token: string
): Promise<PublishCourseResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao publicar curso");
    }

    const data: PublishCourseResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao publicar curso:", error);
    throw error;
  }
}
