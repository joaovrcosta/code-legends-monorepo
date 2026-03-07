"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Module } from "./list-modules";

export interface CreateModuleData {
  title: string;
  slug: string;
}

export interface CreateModuleResponse {
  module: Module;
}

/**
 * Cria um novo módulo
 */
export async function createModule(
  courseId: string,
  moduleData: CreateModuleData,
  token: string
): Promise<CreateModuleResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules`,
      {
        method: "POST",
        headers: await buildApiHeaders(undefined, token),
        body: JSON.stringify(moduleData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar módulo");
    }

    const data: CreateModuleResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao criar módulo");
  }
}

