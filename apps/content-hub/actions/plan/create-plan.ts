"use server";

import { buildApiHeaders } from "@/actions/auth";

export interface CreatePlanData {
  slug: string;
  name: string;
  description?: string | null;
  amountCents?: number;
  order?: number;
  active?: boolean;
  externalId?: string | null;
  productName?: string | null;
}

export async function createPlan(
  data: CreatePlanData,
  token: string
): Promise<{ id: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/plans`,
    {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify({
        slug: data.slug.toUpperCase(),
        name: data.name,
        description: data.description ?? null,
        amountCents: data.amountCents ?? 0,
        order: data.order ?? 0,
        active: data.active ?? true,
        externalId: data.externalId ?? null,
        productName: data.productName ?? null,
      }),
      cache: "no-store",
    }
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message ?? "Erro ao criar plano");
  }
  return { id: (body as { id?: string }).id ?? "" };
}
