"use server";

import type { Group } from "./list-groups";

export interface UpdateGroupData {
  title?: string;
}

export interface UpdateGroupResponse {
  group: Group;
}

/**
 * Atualiza um grupo
 */
export async function updateGroup(
  id: number,
  groupData: UpdateGroupData,
  token: string
): Promise<UpdateGroupResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${id}`,
      {
        method: "PUT",
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
      throw new Error(errorData.message || "Erro ao atualizar grupo");
    }

    const data: UpdateGroupResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar grupo");
  }
}

