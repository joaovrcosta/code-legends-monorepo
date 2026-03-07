"use server";

import { buildApiHeaders } from "@/actions/auth";

/**
 * Exclui um módulo
 */
export async function deleteModule(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modules/${id}`,
      {
        method: "DELETE",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao excluir módulo");
    }
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao excluir módulo");
  }
}

