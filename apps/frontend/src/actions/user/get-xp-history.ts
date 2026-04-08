"use server";

import { getAuthToken } from "../auth/session";

export type XpHistoryRow = {
  xpAmount: number;
  createdAt: string; // ISO
};

export type XpHistoryResponse = {
  from: string;
  toExclusive: string;
  rows: XpHistoryRow[];
};

export async function getXpHistory(params?: {
  days?: number;
  limit?: number;
}): Promise<XpHistoryResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  const search = new URLSearchParams();
  if (params?.days != null) search.set("days", String(params.days));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();

  try {
    const response = await fetch(`${baseUrl}/me/xp/history${qs ? `?${qs}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar histórico de XP:", response.status);
      return null;
    }

    return (await response.json()) as XpHistoryResponse;
  } catch (error) {
    console.error("Erro ao buscar histórico de XP:", error);
    return null;
  }
}

