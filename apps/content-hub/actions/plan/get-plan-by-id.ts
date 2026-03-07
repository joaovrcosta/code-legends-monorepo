"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Plan } from "./list-plans";

export async function getPlanById(
  id: string,
  token?: string
): Promise<Plan | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/plans/${id}`,
      { method: "GET", headers: await buildApiHeaders(undefined, token), cache: "no-store" }
    );

    if (!response.ok) return null;
    const data: Plan = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return null;
  }
}
