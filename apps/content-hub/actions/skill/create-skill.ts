"use server";

import { buildApiHeaders } from "@/actions/auth";

interface CreateSkillInput {
  name: string;
  slug: string;
  description?: string;
}

export async function createSkill(
  data: CreateSkillInput,
  token: string
): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills`, {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("Erro ao criar skill:", response.statusText, body);
      throw new Error(body?.message || "Erro ao criar skill");
    }
  } catch (error) {
    console.error("Erro ao criar skill:", error);
    throw error;
  }
}

