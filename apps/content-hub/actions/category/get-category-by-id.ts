"use server";

import type { Category } from "./list-categories";

/**
 * Busca uma categoria pelo ID
 * Nota: A API não tem endpoint específico para buscar por ID,
 * então buscamos todas as categorias e filtramos
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
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
      return null;
    }

    const data = await response.json();
    const category = data.categories?.find((cat: Category) => cat.id === id);
    return category || null;
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return null;
  }
}
