"use server";

import type { Category } from "./list-categories";

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  active?: boolean;
}

export interface CreateCategoryResponse {
  category: Category;
}

/**
 * Cria uma nova categoria
 */
export async function createCategory(
  categoryData: CreateCategoryData,
  token: string
): Promise<CreateCategoryResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar categoria");
    }

    const data: CreateCategoryResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao criar categoria");
  }
}
