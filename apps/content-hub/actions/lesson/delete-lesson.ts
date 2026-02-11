"use server";

/**
 * Exclui uma aula
 */
export async function deleteLesson(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao excluir aula");
    }
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao excluir aula");
  }
}

