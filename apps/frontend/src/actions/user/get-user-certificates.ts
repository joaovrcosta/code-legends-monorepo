"use server";

import { getAuthToken } from "../auth/session";
import type { CertificateResponse } from "@/types/certificate";

export async function getUserCertificates(): Promise<CertificateResponse> {
  try {
    // Obter o token de autenticação do NextAuth
    const token = await getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return [];
    }

    // Buscar certificados do usuário via API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return [];
    }

    const certificates = await response.json();
    return certificates;
  } catch (error) {
    console.error("Erro ao buscar certificados do usuário:", error);
    return [];
  }
}
