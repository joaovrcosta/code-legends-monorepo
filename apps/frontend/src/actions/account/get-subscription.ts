"use server";

import { getAuthToken } from "@/actions/auth/session";
import { planFromApiToPlanInfo } from "@/lib/plan-utils";
import type { PlanInfo } from "@/components/cart/constants";

export async function getSubscriptionForAccount(): Promise<{
  planInfo: PlanInfo | null;
  hasPaidPlan: boolean;
}> {
  const token = await getAuthToken();
  if (!token) {
    return { planInfo: null, hasPaidPlan: false };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/subscription-overview`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { planInfo: null, hasPaidPlan: false };
  }

  const data = await response.json();
  const { plan, subscription, hasPaidPlan } = data;

  if (!plan) {
    return { planInfo: null, hasPaidPlan: hasPaidPlan ?? false };
  }

  const planInfo = planFromApiToPlanInfo({
    slug: plan.slug,
    name: plan.name,
    description: plan.description ?? null,
    amountCents: plan.amountCents,
    expirationDate: subscription?.endsAt ?? null,
  });

  return { planInfo, hasPaidPlan: hasPaidPlan ?? false };
}
