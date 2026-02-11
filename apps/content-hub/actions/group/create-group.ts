"use server";

import type { Group } from "./list-groups";

export interface CreateGroupData {
  title: string;
}

export interface CreateGroupResponse {
  group: Group;
}

/**
 * Cria um novo grupo (submódulo)
 */
export async function createGroup(
  moduleId: string,
  groupData: CreateGroupData,
  token: string
): Promise<CreateGroupResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleId}/groups`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar grupo");
    }

    const data: CreateGroupResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao criar grupo");
  }
}

