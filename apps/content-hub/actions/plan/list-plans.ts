"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { PlanFeature } from "@code-legends/plans";

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  colorHex?: string | null;
  amountCents: number;
  order: number;
  active: boolean;
  externalId: string | null;
  productName: string | null;
  features?: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface ListPlansResponse {
  plans: Plan[];
}

export async function listPlans(
  token?: string
): Promise<ListPlansResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/plans`,
      { method: "GET", headers: await buildApiHeaders(undefined, token), cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { plans: [] };
    }

    const data: ListPlansResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar planos:", error);
    return { plans: [] };
  }
}
