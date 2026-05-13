"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Request } from "./list-requests";

export async function getRequestById(
  id: string,
  token: string
): Promise<{ request: Request | null; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    if (response.status === 404) {
      return { request: null, message: "Solicitação não encontrada" };
    }

    if (!response.ok) {
      return { request: null, message: "Erro ao carregar solicitação" };
    }

    const data = await response.json();
    return { request: data.request as Request };
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    return { request: null, message: "Erro ao carregar solicitação" };
  }
}
