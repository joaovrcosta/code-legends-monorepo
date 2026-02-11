"use server";

import type { Group } from "./list-groups";

export interface GroupResponse {
  group: Group;
}

/**
 * Busca um grupo pelo ID
 */
export async function getGroupById(id: number): Promise<Group | null> {
  if (!id) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar grupo");
    }

    const data: GroupResponse = await response.json();
    return data.group;
  } catch (error) {
    console.error("Erro ao buscar grupo por ID:", error);
    return null;
  }
}

