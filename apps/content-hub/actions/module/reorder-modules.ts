"use server";

import { updateModule } from "./update-module";

export interface ReorderModulesData {
  moduleId: string;
  orderIndex: number;
}

export async function reorderModules(
  modules: ReorderModulesData[],
  token: string,
): Promise<void> {
  try {
    await Promise.all(
      modules.map(({ moduleId, orderIndex }) =>
        updateModule(moduleId, { orderIndex }, token),
      ),
    );
  } catch (error) {
    console.error("Erro ao reordenar módulos:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao reordenar módulos");
  }
}
