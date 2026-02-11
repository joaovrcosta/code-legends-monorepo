"use server";

/**
 * Deleta uma categoria
 */
export async function deleteCategory(
    id: string,
    token: string
): Promise<void> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Erro ao deletar categoria");
        }
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        throw error instanceof Error
            ? error
            : new Error("Erro ao deletar categoria");
    }
}
