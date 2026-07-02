"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Career } from "./types";

export type UpdateCareerData = Partial<{
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  thumbnail: string | null;
  icon: string | null;
  colorHex: string | null;
  active: boolean;
}>;

export async function adminUpdateCareer(
  id: string,
  data: UpdateCareerData,
  token?: string
): Promise<{ career: Career }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${id}`, {
    method: "PUT",
    headers: await buildApiHeaders(undefined, token),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao atualizar carreira");
  }

  return (await res.json()) as { career: Career };
}

