"use server";

import { getAuthToken } from "../auth/session";

export async function unlinkGoogle(): Promise<{ success: boolean; message?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { success: false, message: "Não autenticado" };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/unlink-google`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data.message || "Erro ao desvincular conta Google" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao desvincular conta Google:", error);
    return { success: false, message: "Erro ao desvincular conta Google" };
  }
}
