"use server";

import { buildApiHeaders } from "@/actions/auth";
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

export async function createCourse(
  courseData: CreateCourseData,
  token: string
): Promise<CreateCourseResponse> {
  try {
    // Normaliza campos opcionais (evita enviar "" e cair em FK/validação no backend)
    const payload: CreateCourseData = {
      ...courseData,
      categoryId: courseData.categoryId?.trim() ? courseData.categoryId : undefined,
      thumbnail: courseData.thumbnail?.trim() ? courseData.thumbnail : undefined,
      icon: courseData.icon?.trim() ? courseData.icon : undefined,
      colorHex: courseData.colorHex?.trim() ? courseData.colorHex : undefined,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const issues = Array.isArray(errorData.issues) ? errorData.issues : null;
      if (issues && issues.length > 0) {
        const pretty = issues
          .map((i: any) => `- ${i.path ? `${i.path}: ` : ""}${i.message ?? "inválido"}`)
          .join("\n");
        throw new Error(`${errorData.message || "Erro ao criar curso"}\n${pretty}`);
      }
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

