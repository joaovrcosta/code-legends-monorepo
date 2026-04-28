"use server";

import { buildApiHeaders } from "@/actions/auth";

export type LessonProductionLogItem = {
  id: string;
  lessonId: number;
  lessonTitle: string;
  fromStatus: string;
  toStatus: string;
  actorId: string;
  actorName: string;
  actorAvatar: string | null;
  createdAt: string;
};

export async function getLessonProductionLogsByCourse(
  courseId: string,
  input?: { limit?: number; cursor?: string | null },
  token?: string
): Promise<{ items: LessonProductionLogItem[]; nextCursor: string | null }> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lessons/production/logs`);
  url.searchParams.set("courseId", courseId);
  if (input?.limit) url.searchParams.set("limit", String(input.limit));
  if (input?.cursor) url.searchParams.set("cursor", input.cursor);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await buildApiHeaders(undefined, token),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Erro ao carregar logs de produção");
  }
  return {
    items: Array.isArray(data.items) ? (data.items as LessonProductionLogItem[]) : [],
    nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
  };
}

