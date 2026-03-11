"use server";

import { getAuthToken } from "@/actions/auth/get-auth-token";
import { revalidatePath } from "next/cache";

export type GamificationSettings = {
  xpPerLesson: number;
  xpPerProject: number;
  xpQuizMultiplier: number;
};

export async function getGamificationSettings(): Promise<{ settings: GamificationSettings }> {
  const token = await getAuthToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-settings/gamification`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ["gamification-settings"] },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao buscar configurações de gamificação (${response.status}): ${body}`);
  }

  return response.json();
}

export async function updateGamificationSettings(
  data: Partial<GamificationSettings>
): Promise<{ settings: GamificationSettings }> {
  const token = await getAuthToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-settings/gamification`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao atualizar configurações de gamificação (${response.status}): ${body}`);
  }

  revalidatePath("/settings/gamification");
  return response.json();
}
