"use server";

import { getAuthToken } from "../auth/session";

/**
 * Gera um certificado para um curso completado
 */
export async function generateCertificate(courseId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao gerar certificado");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao gerar certificado");
  }
}
