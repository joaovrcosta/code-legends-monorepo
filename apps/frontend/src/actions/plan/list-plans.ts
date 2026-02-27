"use server";

export interface PlanFromAPI {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  amountCents: number;
  order: number;
  active: boolean;
  externalId: string | null;
  productName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListPlansResponse {
  plans: PlanFromAPI[];
}

export async function listPlans(): Promise<ListPlansResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/plans`,
      { method: "GET", cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Erro ao listar planos:", response.statusText);
      return { plans: [] };
    }

    const data: ListPlansResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar planos:", error);
    return { plans: [] };
  }
}

export async function getPlanBySlug(
  slug: string
): Promise<PlanFromAPI | null> {
  const { plans } = await listPlans();
  const normalized = slug?.toLowerCase().trim();
  return plans.find((p) => p.slug.toLowerCase() === normalized) ?? null;
}
