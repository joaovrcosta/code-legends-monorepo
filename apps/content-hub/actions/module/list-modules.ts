"use server";

export interface Module {
  id: string;
  title: string;
  slug: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModulesListResponse {
  modules: Module[];
}

/**
 * Lista todos os módulos de um curso
 */
export async function listModules(courseId: string): Promise<ModulesListResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules`,
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
      return { modules: [] };
    }

    const data: ModulesListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar módulos:", error);
    return { modules: [] };
  }
}

