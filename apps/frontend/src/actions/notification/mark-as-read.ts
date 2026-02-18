"use server";

import { getAuthToken } from "../auth/session";

export interface MarkAsReadResponse {
  success: boolean;
  notification?: unknown;
}

export async function markAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  const token = await getAuthToken();

  if (!token) {
    return { success: false };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
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

    const data = await response.json();
    return { success: true, notification: data.notification };
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return { success: false };
  }
}
