"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { CareerModule } from "./types";

export type UpdateCareerModuleData = Partial<{
  title: string;
  description: string | null;
  orderIndex: number;
}>;

export async function adminUpdateCareerModule(
  careerId: string,
  moduleId: string,
  data: UpdateCareerModuleData,
  token?: string
): Promise<{ module: CareerModule }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/modules/${moduleId}`,
    {
      method: "PUT",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao atualizar módulo da carreira");
  }

  return (await res.json()) as { module: CareerModule };
}

