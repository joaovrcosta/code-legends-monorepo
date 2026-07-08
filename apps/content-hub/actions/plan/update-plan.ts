"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { PlanFeature } from "@code-legends/plans";

export interface UpdatePlanData {
  slug?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  colorHex?: string | null;
  amountCents?: number;
  order?: number;
  active?: boolean;
  externalId?: string | null;
  productName?: string | null;
  features?: PlanFeature[];
}

export async function updatePlan(
  id: string,
  data: UpdatePlanData,
  token: string
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.slug !== undefined) payload.slug = data.slug.toUpperCase();
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
  if (data.colorHex !== undefined) payload.colorHex = data.colorHex;
  if (data.amountCents !== undefined) payload.amountCents = data.amountCents;
  if (data.order !== undefined) payload.order = data.order;
  if (data.active !== undefined) payload.active = data.active;
  if (data.externalId !== undefined) payload.externalId = data.externalId;
  if (data.productName !== undefined) payload.productName = data.productName;
  if (data.features !== undefined) payload.features = data.features;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/plans/${id}`,
    {
      method: "PATCH",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message ?? "Erro ao atualizar plano");
  }
}
