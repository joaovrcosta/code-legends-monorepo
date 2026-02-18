"use server";

import { getAuthToken } from "../auth/session";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

export async function getNotifications(
  read?: boolean,
  limit?: number
): Promise<GetNotificationsResponse> {
  const token = await getAuthToken();

  if (!token) {
    return { notifications: [] };
  }

  try {
    const params = new URLSearchParams();
    if (read !== undefined) {
      params.append("read", read.toString());
    }
    if (limit) {
      params.append("limit", limit.toString());
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { notifications: [] };
    }

    const data = await response.json();
    return { notifications: data.notifications || [] };
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return { notifications: [] };
  }
}
