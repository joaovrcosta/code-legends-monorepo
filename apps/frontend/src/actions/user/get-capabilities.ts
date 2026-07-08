"use server";

import { getAuthToken } from "../auth/session";
import { getApiBaseUrl } from "@/lib/api-base-url";
import type { CapabilitiesMap, PlanFeature } from "@code-legends/plans";

export type ActivePlanSummary = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  colorHex: string | null;
  amountCents: number;
} | null;

export type CapabilitiesResponse = {
  capabilities: CapabilitiesMap;
  activePlan: ActivePlanSummary;
  hasPaidPlan: boolean;
};

export async function getCapabilitiesFromAPI(): Promise<CapabilitiesResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/me/capabilities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as CapabilitiesResponse;
  } catch {
    return null;
  }
}

export type { PlanFeature, CapabilitiesMap };
