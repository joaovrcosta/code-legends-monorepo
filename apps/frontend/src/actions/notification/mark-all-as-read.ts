"use server";

import { getAuthToken } from "../auth/session";

export interface MarkAllAsReadResponse {
  success: boolean;
}

export async function markAllAsRead(): Promise<MarkAllAsReadResponse> {
  const token = await getAuthToken();

  if (!token) {
    return { success: false };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar todas como lidas:", error);
    return { success: false };
  }
}
