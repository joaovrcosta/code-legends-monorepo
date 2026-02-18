"use server";

/**
 * Despublica um curso
 */
export async function unpublishCourse(
  courseId: string,
  token: string
): Promise<{ course: { id: string; status: "DRAFT" | "PUBLISHED" } }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/unpublish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao despublicar curso");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao despublicar curso:", error);
    throw error;
  }
}
