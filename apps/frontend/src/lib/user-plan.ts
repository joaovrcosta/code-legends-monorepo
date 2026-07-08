import { UserPlan } from "@code-legends/shared-types";
import {
  PlanFeatures,
  SEED_PLAN_FEATURES,
  buildCapabilitiesMap,
  type CapabilitiesMap,
  type PlanFeature,
} from "@code-legends/plans";

export function normalizeUserPlan(plan?: string | null): UserPlan {
  const value = String(plan ?? "").toUpperCase();
  if (value === UserPlan.PRO) return UserPlan.PRO;
  if (value === UserPlan.PREMIUM) return UserPlan.PREMIUM;
  return UserPlan.FREE;
}

/** Capabilities iniciais a partir do slug (seed FREE/PRO/PREMIUM) até /me/capabilities carregar. */
export function capabilitiesFromPlanSlug(slug: string): CapabilitiesMap {
  const features = SEED_PLAN_FEATURES[slug.toUpperCase()] ?? [];
  return buildCapabilitiesMap(features);
}

/** @deprecated Prefer capabilities from UserPlanProvider / getCapabilitiesFromAPI */
export function isPremium(plan: UserPlan): boolean {
  return plan === UserPlan.PREMIUM;
}

/** @deprecated Prefer capabilities[PlanFeatures.CATALOG_PAID] */
export function hasPaidPlan(plan: UserPlan): boolean {
  return plan === UserPlan.PRO || plan === UserPlan.PREMIUM;
}

/** @deprecated Prefer !capabilities[PlanFeatures.CATALOG_PAID] */
export function isFreePlan(plan: UserPlan): boolean {
  return plan === UserPlan.FREE;
}

export function hasCapability(
  capabilities: CapabilitiesMap,
  feature: PlanFeature,
): boolean {
  return capabilities[feature] === true;
}

export function hasCatalogPaidFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return hasCapability(capabilities, PlanFeatures.CATALOG_PAID);
}

export function hasCareerEnrollFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return hasCapability(capabilities, PlanFeatures.CAREER_ENROLL);
}

export function hasPathUnitFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return hasCapability(capabilities, PlanFeatures.PATH_UNIT_ACCESS);
}

/** Card de trilha de carreira: badge Premium para quem não tem career.enroll. */
export function shouldShowCareerTrackPremiumBadgeFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return !hasCareerEnrollFromCapabilities(capabilities);
}

/** Banner da carreira e Path Units: upsell para quem não tem path_unit.access. */
export function shouldShowCareerPremiumUpsellBadgeFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return !hasPathUnitFromCapabilities(capabilities);
}

/** Catálogo (conteúdo pago): badge Exclusivo apenas sem catalog.paid. */
export function shouldShowExclusiveCatalogBadgeFromCapabilities(
  capabilities: CapabilitiesMap,
): boolean {
  return !hasCatalogPaidFromCapabilities(capabilities);
}

/** @deprecated Use shouldShowCareerTrackPremiumBadgeFromCapabilities */
export function shouldShowCareerTrackPremiumBadge(plan: UserPlan): boolean {
  return shouldShowCareerPremiumUpsellBadge(plan);
}

/** @deprecated Use shouldShowCareerPremiumUpsellBadgeFromCapabilities */
export function shouldShowCareerPremiumUpsellBadge(plan: UserPlan): boolean {
  return !isPremium(plan);
}

/** @deprecated Use shouldShowCareerPremiumUpsellBadgeFromCapabilities */
export function shouldShowFreeUserPremiumUpsell(plan: UserPlan): boolean {
  return shouldShowCareerPremiumUpsellBadge(plan);
}

/** @deprecated Use shouldShowExclusiveCatalogBadgeFromCapabilities */
export function shouldShowExclusiveCatalogBadge(plan: UserPlan): boolean {
  return isFreePlan(plan);
}

/** @deprecated Use hasPathUnitFromCapabilities */
export function canAccessPathUnit(plan: UserPlan): boolean {
  return isPremium(plan);
}
