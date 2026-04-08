"use server";

import { getAuthToken } from "../auth/session";

export type WeeklyXpDay = {
  date: string; // YYYY-MM-DD
  xp: number;
};

export type WeeklyXpResponse = {
  from: string;
  toExclusive: string;
  days: WeeklyXpDay[];
  totalXp: number;
};

export async function getWeeklyXp(): Promise<WeeklyXpResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  try {
    const response = await fetch(`${baseUrl}/me/xp/weekly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar XP semanal:", response.status);
      return null;
    }

    return (await response.json()) as WeeklyXpResponse;
  } catch (error) {
    console.error("Erro ao buscar XP semanal:", error);
    return null;
  }
}

