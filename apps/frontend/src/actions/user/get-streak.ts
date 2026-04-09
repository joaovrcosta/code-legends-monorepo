"use server";

import { getAuthToken } from "../auth/session";

export type StreakResponse = {
  current: number;
  best: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
};

export async function getStreak(): Promise<StreakResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  try {
    const response = await fetch(`${baseUrl}/me/streak`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar streak:", response.status);
      return null;
    }

    return (await response.json()) as StreakResponse;
  } catch (error) {
    console.error("Erro ao buscar streak:", error);
    return null;
  }
}

