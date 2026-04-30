"use server";

import { getAuthToken } from "../auth/session";
import type { ListCareersResponse } from "@/types/career";

export async function listCareers(): Promise<ListCareersResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  // endpoint é público, mas se tiver token a gente envia igual
  const token = await getAuthToken();

  const res = await fetch(`${baseUrl}/careers`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao listar carreiras");
  }

  return (await res.json()) as ListCareersResponse;
}

