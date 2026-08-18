"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { ForumQuestionDetail } from "./list-questions";

export async function getDuvida(
  id: string,
  token: string,
): Promise<{ question: ForumQuestionDetail | null; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/forum/questions/${id}`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        question: null,
        message: errorData.message || "Dúvida não encontrada",
      };
    }

    const data = await response.json();
    return { question: data.question ?? null };
  } catch (error) {
    console.error("Erro ao buscar dúvida:", error);
    return { question: null, message: "Erro ao buscar dúvida" };
  }
}
