"use server";

import type { Module } from "./list-modules";

export interface ModuleResponse {
  module: Module;
}

/**
 * Busca um módulo pelo slug
 */
export async function getModuleBySlug(slug: string): Promise<Module | null> {
  if (!slug) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modules/${slug}`,
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
      throw new Error("Erro ao buscar módulo");
    }

    const data: ModuleResponse = await response.json();
    return data.module;
  } catch (error) {
    console.error("Erro ao buscar módulo por slug:", error);
    return null;
  }
}

