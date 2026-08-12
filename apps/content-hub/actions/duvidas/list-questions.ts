"use server";

import { buildApiHeaders } from "@/actions/auth";

export type ForumQuestionStatus = "WAITING_ANSWER" | "ANSWERED";

export type ForumAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};

export type ForumCourseSummary = {
  id: string;
  title: string;
  thumbnail: string | null;
  colorHex: string | null;
};

export type ForumLessonSummary = {
  id: number;
  title: string;
};

export type ForumQuestionListItem = {
  id: string;
  authorId: string;
  courseId: string | null;
  lessonId: number | null;
  body: string;
  preview: string;
  status: ForumQuestionStatus;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
  course: ForumCourseSummary | null;
  lesson: ForumLessonSummary | null;
  _count?: { answers: number };
};

export type ForumAnswer = {
  id: string;
  questionId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
};

export type ForumQuestionDetail = Omit<ForumQuestionListItem, "preview"> & {
  answers: ForumAnswer[];
};

export type ListDuvidasParams = {
  status?: ForumQuestionStatus;
  q?: string;
};

export async function listDuvidas(
  token: string,
  params: ListDuvidasParams = {},
): Promise<ForumQuestionListItem[]> {
  try {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.q?.trim()) search.set("q", params.q.trim());
    const qs = search.toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/forum/questions${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Erro ao listar dúvidas:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.questions ?? [];
  } catch (error) {
    console.error("Erro ao listar dúvidas:", error);
    return [];
  }
}
