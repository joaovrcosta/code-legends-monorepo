import { SEED_PLAN_FEATURES } from './features'
import type { PlanFeature } from './features'

export const IMPLICIT_FREE_SLUG = 'FREE' as const

/** Plano gratuito implícito — fallback de runtime, não depende de linha no banco.
 *  Usuários free: User.planId IS NULL (não JOIN Plan WHERE slug = 'FREE'). */
export const IMPLICIT_FREE_PLAN = {
  id: null,
  slug: IMPLICIT_FREE_SLUG,
  name: 'Plano gratuito',
  features: SEED_PLAN_FEATURES.FREE as PlanFeature[],
  amountCents: 0,
  imageUrl: null,
  colorHex: '#B8E62E',
} as const

export type ImplicitFreePlan = typeof IMPLICIT_FREE_PLAN

export function isImplicitFreeSlug(slug: string | null | undefined): boolean {
  return (slug ?? '').toUpperCase() === IMPLICIT_FREE_SLUG
}
