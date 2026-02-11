import { Category } from "@/types/categories";

export async function listCategories(): Promise<Category[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories`,
    {
      next: { revalidate: 60 }, // opcional: cache de 1min
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  const data = await response.json();
  return data.categories; // <- AQUI está o segredo
}
