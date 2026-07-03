"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Module } from "./list-modules";

export interface UpdateModuleData {
  title?: string;
  slug?: string;
  orderIndex?: number;
}

export interface UpdateModuleResponse {
  module: Module;
}

/**
 * Atualiza um módulo
 */
export async function updateModule(
  id: string,
  moduleData: UpdateModuleData,
  token: string
): Promise<UpdateModuleResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modules/${id}`,
      {
        method: "PUT",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify(moduleData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar módulo");
    }

    const data: UpdateModuleResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar módulo");
  }
}

