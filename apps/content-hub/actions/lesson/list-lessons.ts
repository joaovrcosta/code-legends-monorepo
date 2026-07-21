"use server";

import type { Challenge } from '@code-legends/challenges'
export type { ChallengeType, Challenge, ParsonsPiece } from '@code-legends/challenges'

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: string;
  slug: string;
  url?: string | null;
  isFree: boolean;
  video_url?: string | null;
  video_duration?: string | null;
  video?: {
    url: string | null;
    duration: string | null;
    providerId?: string | null;
    provider?: {
      id: string;
      slug?: string;
      name?: string;
      handlerKey?: string;
    } | null;
  } | null;
  article?: { body: string } | null;
  quiz?: { content: Challenge[] } | null;
  project?: { description: string; specs?: Record<string, unknown> | null } | null;
  lab?: {
    description: string;
    category?: string | null;
    learnTitle?: string | null;
    durationMinutes?: number | null;
    learnBody?: string | null;
    specs?: Record<string, unknown> | null;
  } | null;
  locked: boolean;
  order?: number | null;
  submoduleId: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonsListResponse {
  lessons: Lesson[];
}

export interface ListLessonsOptions {
  includeContent?: boolean;
}

/**
 * Lista todas as aulas de um grupo
 */
export async function listLessons(
  groupId: number,
  options?: ListLessonsOptions,
): Promise<LessonsListResponse> {
  const includeContent = options?.includeContent !== false;
  const query = `includeContent=${includeContent ? "true" : "false"}`;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/lessons?${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { lessons: [] };
    }

    const data: LessonsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar aulas:", error);
    return { lessons: [] };
  }
}
