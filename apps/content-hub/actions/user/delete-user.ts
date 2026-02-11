"use server";

/**
 * Exclui um usuário
 */
export async function deleteUser(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
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
      throw new Error(errorData.message || "Erro ao excluir usuário");
    }
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao excluir usuário");
  }
}



