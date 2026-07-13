"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function deletePlan(id: string, token: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/plans/${id}`,
    {
      method: "DELETE",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Erro ao excluir plano",
    );
  }
}
