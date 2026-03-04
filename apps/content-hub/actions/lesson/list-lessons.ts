"use server";

export type ChallengeType =
  | "prediction"
  | "bug"
  | "refactor"
  | "complete"
  | "conceptual";

export interface Challenge {
  type: ChallengeType;
  question: string;
  code?: string;
  language?: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
  placeholder?: string;
}

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
  video?: { url: string | null; duration: string | null } | null;
  article?: { body: string } | null;
  quiz?: { content: Challenge[] } | null;
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

/**
 * Lista todas as aulas de um grupo
 */
export async function listLessons(groupId: number): Promise<LessonsListResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/lessons`,
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

