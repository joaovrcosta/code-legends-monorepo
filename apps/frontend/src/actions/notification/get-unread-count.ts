"use server";

import { getAuthToken } from "../auth/session";

export interface GetUnreadCountResponse {
  count: number;
}

export async function getUnreadCount(): Promise<GetUnreadCountResponse> {
  const token = await getAuthToken();

  if (!token) {
    return { count: 0 };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { count: 0 };
    }

    const data = await response.json();
    return { count: data.count || 0 };
  } catch (error) {
    console.error("Erro ao buscar contagem de não lidas:", error);
    return { count: 0 };
  }
}
