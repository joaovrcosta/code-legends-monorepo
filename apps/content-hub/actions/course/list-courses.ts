"use server";

import { buildApiHeaders } from "@/actions/auth";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  instructorId: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree: boolean;
  active: boolean;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  releaseAt?: string | null;
  kind?: "CATALOG" | "PATH_UNIT";
  exclusiveCareerId?: string | null;
  exclusiveCareer?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
  /** Inscrições reais (UserCourse) — vem do GET /courses via `_count` */
  _count?: { userCourses: number };
}

export interface CoursesListResponse {
  courses: Course[];
}

/**
 * Lista todos os cursos disponíveis
 */
export async function listCourses(params?: {
  category?: string;
  categorySlug?: string;
  instructor?: string;
  search?: string;
  forCareerId?: string;
  kind?: "CATALOG" | "PATH_UNIT";
  token?: string;
}): Promise<CoursesListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.categorySlug) searchParams.append("categorySlug", params.categorySlug);
    if (params?.instructor) searchParams.append("instructor", params.instructor);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.forCareerId) searchParams.append("forCareerId", params.forCareerId);
    if (params?.kind) searchParams.append("kind", params.kind);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/courses${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: await buildApiHeaders(undefined, params?.token),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { courses: [] };
    }

    const data: CoursesListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    return { courses: [] };
  }
}

