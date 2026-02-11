"use server";

import type { Lesson } from "./list-lessons";

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  expertise?: string[];
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  courseId: string;
}

export interface Submodule {
  id: number;
  title: string;
  moduleId: string;
  module?: Module;
}

export interface LessonDetail extends Omit<Lesson, 'id'> {
  id: number | string;
  completed?: boolean;
  completedAt?: string | null;
  author?: Author;
  submodule?: Submodule;
}

export interface LessonResponse {
  lesson: LessonDetail;
}

/**
 * Busca uma aula pelo slug com todos os detalhes (author, submodule, etc.)
 */
export async function getLessonBySlug(slug: string, token: string): Promise<LessonDetail | null> {
  if (!slug) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar aula");
    }

    const data: LessonResponse = await response.json();
    return data.lesson;
  } catch (error) {
    console.error("Erro ao buscar aula por slug:", error);
    return null;
  }
}

