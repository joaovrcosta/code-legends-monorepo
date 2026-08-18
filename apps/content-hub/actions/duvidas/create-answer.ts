"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { ForumAnswer } from "./list-questions";

export async function createDuvidaAnswer(
  questionId: string,
  body: string,
  token: string,
): Promise<{ success: boolean; message: string; answer?: ForumAnswer }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/forum/questions/${questionId}/answers`,
      {
        method: "POST",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify({ body }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Erro ao enviar resposta",
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Resposta enviada com sucesso",
      answer: data.answer,
    };
  } catch (error) {
    console.error("Erro ao responder dúvida:", error);
    return { success: false, message: "Erro ao enviar resposta" };
  }
}
