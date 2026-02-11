"use server";

/**
 * Exclui um curso
 */
export async function deleteCourse(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`,
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
      throw new Error(errorData.message || "Erro ao excluir curso");
    }
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao excluir curso");
  }
}

