"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function adminDeleteCareerModule(
  careerId: string,
  moduleId: string,
  token?: string
): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/modules/${moduleId}`,
    {
      method: "DELETE",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao excluir módulo da carreira");
  }
}

