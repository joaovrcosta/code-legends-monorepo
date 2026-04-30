"use server";

import { getAuthToken } from "../auth/session";
import { revalidatePath } from "next/cache";
import type { EnrollCareerResponse } from "@/types/career";

export async function enrollInCareer(
  careerId: string
): Promise<EnrollCareerResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const res = await fetch(`${baseUrl}/careers/${careerId}/enroll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao se inscrever na carreira");
  }

  const data = (await res.json()) as EnrollCareerResponse;

  try {
    revalidatePath("/learn/careers");
    revalidatePath(`/learn/careers/${careerId}`);
  } catch {
    // ignore
  }

  return data;
}

