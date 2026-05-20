"use server";

import { getAuthToken, getCurrentSession } from "../auth/session";

export type UserSkillTrackingItem = {
  skillId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  xp: number;
  previousXp?: number;
  xpGainedThisWeek?: number;
};

type UserSkillsApiResponse = {
  skills?: UserSkillTrackingItem[];
};

export async function getMySkills(): Promise<{ skills: UserSkillTrackingItem[] }> {
  const token = await getAuthToken();
  const session = await getCurrentSession();

  if (!token || !session?.id) {
    return { skills: [] };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  try {
    const response = await fetch(`${baseUrl}/users/${session.id}/skills`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Token inválido ao buscar skills do usuário");
      } else {
        console.error("Erro ao buscar skills:", response.status);
      }
      return { skills: [] };
    }

    const data = (await response.json()) as UserSkillsApiResponse;
    return { skills: data.skills ?? [] };
  } catch (error) {
    console.error("Erro ao buscar skills do usuário:", error);
    return { skills: [] };
  }
}
