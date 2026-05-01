"use server";

import { getAuthToken } from "../auth/session";

export async function generateCareerCertificate(careerId: string) {
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
      body: JSON.stringify({ careerId }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ??
      "Erro ao gerar certificado de carreira",
    );
  }

  return (await response.json()) as { certificate: unknown };
}
