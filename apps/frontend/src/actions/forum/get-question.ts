"use server";

import { getAuthToken } from "../auth/session";
import type { ForumQuestionDetail } from "@/types/forum";

export async function getForumQuestion(
  id: string,
): Promise<ForumQuestionDetail | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/forum/questions/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Erro ao buscar pergunta do fórum:", response.statusText);
    return null;
  }

  const data = await response.json();
  return data.question ?? null;
}
