"use server";

import { updateGroup } from "./update-group";

export interface ReorderGroupsData {
  groupId: number;
  orderIndex: number;
}

export async function reorderGroups(
  groups: ReorderGroupsData[],
  token: string,
): Promise<void> {
  try {
    await Promise.all(
      groups.map(({ groupId, orderIndex }) =>
        updateGroup(groupId, { orderIndex }, token),
      ),
    );
  } catch (error) {
    console.error("Erro ao reordenar submódulos:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao reordenar submódulos");
  }
}
