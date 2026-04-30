"use server";

import { getAuthToken } from "../auth/session";
import type { GetCareerBySlugResponse } from "@/types/career";

export async function getCareerBySlug(
  slug: string
): Promise<GetCareerBySlugResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const res = await fetch(`${baseUrl}/careers/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao buscar carreira");
  }

  return (await res.json()) as GetCareerBySlugResponse;
}

