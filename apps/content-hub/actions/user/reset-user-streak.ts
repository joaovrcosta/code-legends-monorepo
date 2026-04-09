"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function resetUserStreak(userId: string, token?: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/streak/reset`,
    {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorData.message || "Erro ao zerar streak do usuário");
  }
}

