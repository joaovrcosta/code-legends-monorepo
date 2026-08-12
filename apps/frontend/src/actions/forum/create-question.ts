"use server";

import { getAuthToken } from "../auth/session";
import type { ForumQuestionListItem } from "@/types/forum";

export type CreateForumQuestionData = {
  body: string;
  courseId?: string | null;
  lessonId?: number | null;
};

export type CreateForumQuestionResult = {
  success: boolean;
  message: string;
  question?: ForumQuestionListItem;
};

export async function createForumQuestion(
  data: CreateForumQuestionData,
): Promise<CreateForumQuestionResult> {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, message: "Usuário não autenticado" };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/forum/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          body: data.body,
          courseId: data.courseId ?? null,
          lessonId: data.lessonId ?? null,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Erro ao criar pergunta",
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: "Pergunta enviada com sucesso",
      question: result.question,
    };
  } catch (error) {
    console.error("Erro ao criar pergunta do fórum:", error);
    return {
      success: false,
      message: "Erro ao criar pergunta. Tente novamente.",
    };
  }
}
