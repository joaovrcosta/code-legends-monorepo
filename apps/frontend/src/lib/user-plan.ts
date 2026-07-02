import { UserPlan } from "@code-legends/shared-types";

export function normalizeUserPlan(plan?: string | null): UserPlan {
  const value = String(plan ?? "").toUpperCase();
  if (value === UserPlan.PRO) return UserPlan.PRO;
  if (value === UserPlan.PREMIUM) return UserPlan.PREMIUM;
  return UserPlan.FREE;
}

export function isPremium(plan: UserPlan): boolean {
  return plan === UserPlan.PREMIUM;
}

export function hasPaidPlan(plan: UserPlan): boolean {
  return plan === UserPlan.PRO || plan === UserPlan.PREMIUM;
}

export function isFreePlan(plan: UserPlan): boolean {
  return plan === UserPlan.FREE;
}

/** Card de trilha de carreira: badge Premium para FREE e PRO. */
export function shouldShowCareerTrackPremiumBadge(plan: UserPlan): boolean {
  return shouldShowCareerPremiumUpsellBadge(plan);
}

/** Banner da carreira e Path Units: badge Premium para quem ainda não é Premium (FREE e PRO). */
export function shouldShowCareerPremiumUpsellBadge(plan: UserPlan): boolean {
  return !isPremium(plan);
}

/** @deprecated Use shouldShowCareerPremiumUpsellBadge — mantido para compatibilidade. */
export function shouldShowFreeUserPremiumUpsell(plan: UserPlan): boolean {
  return shouldShowCareerPremiumUpsellBadge(plan);
}

/** Catálogo (conteúdo pago): badge Exclusivo apenas para FREE. */
export function shouldShowExclusiveCatalogBadge(plan: UserPlan): boolean {
  return isFreePlan(plan);
}

/** Path Units acessíveis apenas com plano Premium. */
export function canAccessPathUnit(plan: UserPlan): boolean {
  return isPremium(plan);
}
