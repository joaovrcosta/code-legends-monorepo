"use server";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  categories: Category[];
}

/**
 * Lista todas as categorias
 */
export async function listCategories(): Promise<CategoriesListResponse> {
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
      return { categories: [] };
    }

    const data: CategoriesListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return { categories: [] };
  }
}

