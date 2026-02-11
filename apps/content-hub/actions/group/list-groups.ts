"use server";

export interface Group {
  id: number;
  title: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupsListResponse {
  groups: Group[];
}

/**
 * Lista todos os grupos (submódulos) de um módulo
 */
export async function listGroups(moduleId: string): Promise<GroupsListResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleId}/groups`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { groups: [] };
    }

    const data: GroupsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar grupos:", error);
    return { groups: [] };
  }
}

