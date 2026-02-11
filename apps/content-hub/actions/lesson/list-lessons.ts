"use server";

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

