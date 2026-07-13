import type { LessonWithContent } from "@/types/roadmap";

export interface LessonResponse {
  lesson: LessonWithContent;
  moduleTitle: string;
  groupTitle: string;
  status: "completed" | "unlocked" | "locked";
  isCurrent: boolean;
  canReview: boolean;
  module: {
    id: string;
    slug: string;
    title: string;
  };
  group: {
    id: number;
    slug?: string;
    title: string;
  };
  navigation?: {
    previous?: {
      slug: string;
      title: string;
      moduleSlug: string;
      groupSlug: string;
    };
    next?: {
      slug: string;
      title: string;
      moduleSlug: string;
      groupSlug: string;
    };
  };
}

/** Resposta quando a API retorna 403 (conteúdo exclusivo para assinantes). Não lança erro. */
export interface LessonUpgradeRequired {
  __upgradeRequired: true;
  message: string;
}

/** API retornou 404 (aula inexistente ou curso indisponível para o aluno). */
export type LessonApiNotFound = { __apiNotFound: true };

export function isLessonApiNotFound(
  data: LessonResponse | LessonUpgradeRequired | LessonApiNotFound | null
): data is LessonApiNotFound {
  return !!data && typeof data === "object" && "__apiNotFound" in data;
}

export type LessonBySlugResult =
  | LessonResponse
  | LessonUpgradeRequired
  | LessonApiNotFound
  | null;
