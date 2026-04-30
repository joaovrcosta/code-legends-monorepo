"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { CareerModule } from "./types";

export type CreateCareerModuleData = {
  title: string;
  description?: string;
  orderIndex?: number;
};

export async function adminCreateCareerModule(
  careerId: string,
  data: CreateCareerModuleData,
  token?: string
): Promise<{ module: CareerModule }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/modules`,
    {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao criar módulo da carreira");
  }

  return (await res.json()) as { module: CareerModule };
}

