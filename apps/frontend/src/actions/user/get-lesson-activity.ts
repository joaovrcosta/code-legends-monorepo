"use server";

import { getAuthToken } from "../auth/session";

export type LessonActivityDay = {
  date: string; // YYYY-MM-DD
  count: number;
};

export type LessonActivityResponse = {
  from: string;
  toExclusive: string;
  days: LessonActivityDay[];
};

export async function getLessonActivity(params?: {
  days?: number;
}): Promise<LessonActivityResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  const search = new URLSearchParams();
  if (params?.days != null) search.set("days", String(params.days));
  const qs = search.toString();

  try {
    const response = await fetch(
      `${baseUrl}/me/activity/lessons${qs ? `?${qs}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Erro ao buscar atividade de aulas:", response.status);
      return null;
    }

    return (await response.json()) as LessonActivityResponse;
  } catch (error) {
    console.error("Erro ao buscar atividade de aulas:", error);
    return null;
  }
}

