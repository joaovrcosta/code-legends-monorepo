"use server";

import { buildApiHeaders } from "@/actions/auth";

/**
 * Zera todo o XP do aluno na API: UserSkillXp, UserSkillXpHistory, UserXpHistory,
 * UserXpEvent e recalcula totalXp / nível / xpToNextLevel para zero.
 * Rota protegida (instrutor/admin).
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
