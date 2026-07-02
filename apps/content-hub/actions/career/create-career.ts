"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Career } from "./types";

export type CreateCareerData = {
  slug: string;
  title: string;
  description?: string;
  longDescription?: string;
  thumbnail?: string;
  icon?: string;
  colorHex?: string;
  active?: boolean;
};

export async function adminCreateCareer(
  data: CreateCareerData,
  token?: string
): Promise<{ career: Career }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/careers`, {
    method: "POST",
    headers: await buildApiHeaders(undefined, token),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao criar carreira");
  }

  return (await res.json()) as { career: Career };
}

