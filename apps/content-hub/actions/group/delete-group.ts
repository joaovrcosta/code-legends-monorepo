"use server";

/**
 * Exclui um grupo
 */
export async function deleteGroup(id: number, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/groups/${id}`,
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
      throw new Error(errorData.message || "Erro ao excluir grupo");
    }
  } catch (error) {
    console.error("Erro ao excluir grupo:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao excluir grupo");
  }
}

