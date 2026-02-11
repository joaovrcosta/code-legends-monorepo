"use server";

import type { Category } from "./list-categories";

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

export interface UpdateCategoryResponse {
  category: Category;
}

/**
 * Atualiza uma categoria existente
 */
export async function updateCategory(
  id: string,
  categoryData: UpdateCategoryData,
  token: string
): Promise<UpdateCategoryResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar categoria");
    }

    const data: UpdateCategoryResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar categoria");
  }
}
