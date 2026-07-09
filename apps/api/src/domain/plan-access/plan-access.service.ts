import {
  ALL_PLAN_FEATURES,
  IMPLICIT_FREE_PLAN,
  buildCapabilitiesMap,
  isImplicitFreeSlug,
  type PlanFeature,
} from '@code-legends/plans'
import type { PlanAccessPort, ResolvedPlan } from './plan-access.port'
import { PlanAccessRepository } from './plan-access.repository'

function normalizePlan(plan: ResolvedPlan | null): ResolvedPlan {
  if (!plan || isImplicitFreeSlug(plan.slug)) {
    return { ...IMPLICIT_FREE_PLAN }
  }
  return plan
}

export class PlanAccessService implements PlanAccessPort {
  constructor(private repository: PlanAccessRepository = new PlanAccessRepository()) {}

  async getActivePlan(userId: string): Promise<ResolvedPlan> {
    const activeSubscription =
      await this.repository.findActiveSubscriptionPlanId(userId)

    if (activeSubscription) {
      const plan = await this.repository.findPlanById(activeSubscription.planId)
      if (plan) return normalizePlan(plan)
    }

    const userPlanId = await this.repository.findUserPlanId(userId)
    if (userPlanId) {
      const plan = await this.repository.findPlanById(userPlanId)
      if (plan) return normalizePlan(plan)
    }

    return { ...IMPLICIT_FREE_PLAN }
  }

  async hasFeature(userId: string, feature: PlanFeature): Promise<boolean> {
    const plan = await this.getActivePlan(userId)
    return plan.features.includes(feature)
  }

  async getCapabilities(
    userId: string,
  ): Promise<Record<PlanFeature, boolean>> {
    const plan = await this.getActivePlan(userId)
    return buildCapabilitiesMap(plan.features)
  }

  hasFeatureInPlan(plan: ResolvedPlan | null, feature: PlanFeature): boolean {
    const normalized = normalizePlan(plan)
    return normalized.features.includes(feature)
  }

  static allFeaturesDisabled(): Record<PlanFeature, boolean> {
    return buildCapabilitiesMap([])
  }

  static allFeatureKeys(): readonly PlanFeature[] {
    return ALL_PLAN_FEATURES
  }
}
