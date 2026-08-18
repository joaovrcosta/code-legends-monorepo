"use server";

import { getAuthToken } from "../auth/session";
import type { ForumQuestionListItem, ForumQuestionStatus } from "@/types/forum";

export type ListForumQuestionsParams = {
  status?: ForumQuestionStatus;
  courseId?: string | "geral";
  q?: string;
};

export async function listForumQuestions(
  params: ListForumQuestionsParams = {},
): Promise<ForumQuestionListItem[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.courseId) search.set("courseId", params.courseId);
  if (params.q?.trim()) search.set("q", params.q.trim());

  const qs = search.toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL}/forum/questions${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Erro ao listar perguntas do fórum:", response.statusText);
    return [];
  }

  const data = await response.json();
  return data.questions ?? [];
}
