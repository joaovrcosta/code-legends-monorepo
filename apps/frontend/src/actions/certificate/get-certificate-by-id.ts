"use server";

import type { CertificateVerifyResponse } from "@/types/certificate";

/**
 * Busca um certificado por ID para verificação (rota pública)
 */
export async function getCertificateById(
  certificateId: string
): Promise<CertificateVerifyResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/certificates/verify/${certificateId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error("Erro na resposta da API:", response.statusText);
      return null;
    }

    const data: CertificateVerifyResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar certificado:", error);
    return null;
  }
}
