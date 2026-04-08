"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { User } from "./list-users";

export interface UserSkillItem {
  skillId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  xp: number;
}

export interface UserSkillsResponse {
  user: User;
  skills: UserSkillItem[];
}

export async function getUserSkills(
  userId: string,
  token?: string
): Promise<UserSkillsResponse | null> {
  if (!userId) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/skills`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return null;
      }

      throw new Error("Erro ao buscar skills do usuário");
    }

    const data: UserSkillsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar skills do usuário:", error);
    return null;
  }
}
