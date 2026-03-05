"use server";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coursesCount?: number;
}

export interface SkillsListResponse {
  skills: Skill[];
}

export async function listSkills(search?: string): Promise<SkillsListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (search) {
      searchParams.append("search", search);
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/skills${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API ao listar skills:", response.statusText);
      return { skills: [] };
    }

    const data: SkillsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar skills:", error);
    return { skills: [] };
  }
}

