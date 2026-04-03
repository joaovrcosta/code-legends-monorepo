"use server";

import { buildApiHeaders } from "@/actions/auth";

/**
 * Remove todo o XP por skill e o histórico (UserSkillXp / UserSkillXpHistory).
 * Não altera totalXp/nível globais do usuário. Apenas administradores (API).
 */
export async function resetUserSkills(userId: string, token?: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/skills`,
    {
      method: "DELETE",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorData.message || "Erro ao zerar skills do usuário");
  }
}
