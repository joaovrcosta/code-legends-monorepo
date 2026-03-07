"use server";

import { buildApiHeaders } from "@/actions/auth";

interface UpdateSkillInput {
  name?: string;
  slug?: string;
  description?: string | null;
}

export async function updateSkill(
  id: string,
  data: UpdateSkillInput,
  token: string
): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
      {
        method: "PUT",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("Erro ao atualizar skill:", response.statusText, body);
      throw new Error(body?.message || "Erro ao atualizar skill");
    }
  } catch (error) {
    console.error("Erro ao atualizar skill:", error);
    throw error;
  }
}

