"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAuthToken } from "../auth/session";
import { getActiveCourse } from "../user/get-active-course";

export interface ContinueCourseResult {
  success: boolean;
  nextLessonId: number | null;
  moduleCompleted: boolean;
  /** true só quando o módulo acaba de atingir 100% nesta conclusão */
  moduleNewlyCompleted?: boolean;
  moduleId?: string;
  moduleTitle?: string;
  courseCompleted: boolean;
  courseProgress: number;
  xpGained?: number;
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
  progress?: number;
  xpGainedInModule?: number;
  xpGainedInModuleBySkill?: { skillId: string; xp: number }[];
  streak?: {
    current: number;
    best: number;
    totalActiveDays: number;
    increasedToday: boolean;
  };
}

export async function continueCourse(
  lessonId: number,
  courseId?: string,
  score?: number
): Promise<ContinueCourseResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      // Usuário não autenticado - comportamento esperado
      throw new Error("Token de autenticação não encontrado");
    }

    const body =
      score !== undefined ? JSON.stringify({ score }) : undefined;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
        cache: "no-store",
      }
    );

    {
      const peek = response.clone();
      peek
        .text()
        .then((t) => {
          let parsed: unknown = null;
          try {
            parsed = t ? JSON.parse(t) : null;
          } catch {
            parsed = { rawLen: t?.length ?? 0 };
          }
          fetch(
            "http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "814d8b",
              },
              body: JSON.stringify({
                sessionId: "814d8b",
                runId: "pre-fix",
                hypothesisId: "A-D",
                location: "continue.ts:afterFetch",
                message: "complete lesson fetch result",
                data: {
                  lessonId,
                  score: score ?? null,
                  status: response.status,
                  ok: response.ok,
                  bodyPreview: parsed,
                },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => { });
        })
        .catch(() => { });
    }
    // #endregion

    if (!response.ok) {
      if (response.status === 404) {
        console.error("Lição não encontrada");
        throw new Error("Lição não encontrada");
      }

      if (response.status === 401) {
        console.error("Não autorizado");
        throw new Error("Não autorizado");
      }

      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta da API:", errorData);
      throw new Error(
        (errorData as { message?: string }).message ||
        "Erro ao marcar lição como completa"
      );
    }

    const data = (await response.json()) as ContinueCourseResult;

    // Invalida o cache do roadmap após marcar a lição como completa
    try {
      // Se courseId não foi fornecido, busca o curso ativo
      const activeCourseId = courseId || (await getActiveCourse())?.id;

      if (activeCourseId) {
        // Invalida o cache do roadmap usando a tag
        revalidateTag(`roadmap-${activeCourseId}`);
        // Também revalida a página do learn para forçar atualização
        revalidatePath("/learn", "page");
      }
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache do roadmap:", cacheError);
    }

    return {
      ...data,
      success: true,
    };
  } catch (error) {
    console.error("Erro ao continuar curso:", error);
    throw error instanceof Error ? error : new Error("Erro ao continuar curso");
  }
}
