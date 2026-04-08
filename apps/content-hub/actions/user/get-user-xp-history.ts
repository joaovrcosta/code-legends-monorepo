"use server";

import { buildApiHeaders } from "@/actions/auth";

export type UserXpHistoryRow = {
  xpAmount: number;
  createdAt: string; // ISO
};

export type UserXpHistoryResponse = {
  from: string;
  toExclusive: string;
  rows: UserXpHistoryRow[];
};

export async function getUserXpHistory(
  userId: string,
  token: string,
  params?: { days?: number; limit?: number }
): Promise<UserXpHistoryResponse | null> {
  if (!userId) return null;

  const search = new URLSearchParams();
  if (params?.days != null) search.set("days", String(params.days));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/xp/history${
        qs ? `?${qs}` : ""
      }`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Erro ao buscar histórico de XP do usuário");
    }

    return (await response.json()) as UserXpHistoryResponse;
  } catch (error) {
    console.error("Erro ao buscar histórico de XP do usuário:", error);
    return null;
  }
}

