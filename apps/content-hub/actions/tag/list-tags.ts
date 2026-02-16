"use server";

export interface Tag {
  id: string;
  name: string;
}

export interface TagsListResponse {
  tags: Tag[];
}

/**
 * Lista todas as tags disponíveis
 */
export async function listTags(search?: string): Promise<TagsListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (search) {
      searchParams.append("search", search);
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/tags${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { tags: [] };
    }

    const data: TagsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    return { tags: [] };
  }
}
