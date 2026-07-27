import { cache } from "react";
import { getSubscriptionForAccount } from "@/actions/account/get-subscription";
import { listPlans } from "@/actions/plan/list-plans";
import { canUserUpgrade } from "@/lib/plan-utils";

/**
 * Deduped within a single RSC request via React.cache().
 * planSlug comes only from getSubscriptionForAccount (always an object;
 * planSlug is null when there is no active plan — including post-endsAt).
 */
export const getUpgradeEligibility = cache(async () => {
  const [{ plans }, sub] = await Promise.all([
    listPlans(),
    getSubscriptionForAccount(),
  ]);
  const slug = sub.planSlug ?? null;
  return {
    canUpgrade: canUserUpgrade(slug, plans),
    slug,
    plans,
  };
});
