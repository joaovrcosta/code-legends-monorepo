import {
  ALL_PLAN_FEATURES,
  buildCapabilitiesMap,
  type PlanFeature,
} from '@code-legends/plans'
import type { PlanAccessPort, ResolvedPlan } from './plan-access.port'
import { PlanAccessRepository } from './plan-access.repository'

export class PlanAccessService implements PlanAccessPort {
  constructor(private repository: PlanAccessRepository = new PlanAccessRepository()) {}

  async getActivePlan(userId: string): Promise<ResolvedPlan | null> {
    const activeSubscription =
      await this.repository.findActiveSubscriptionPlanId(userId)

    if (activeSubscription) {
      const plan = await this.repository.findPlanById(activeSubscription.planId)
      if (plan) return plan
    }

    const userPlanId = await this.repository.findUserPlanId(userId)
    if (userPlanId) {
      const plan = await this.repository.findPlanById(userPlanId)
      if (plan) return plan
    }

    return this.repository.findFreePlan()
  }

  async hasFeature(userId: string, feature: PlanFeature): Promise<boolean> {
    const plan = await this.getActivePlan(userId)
    if (!plan) return false
    return plan.features.includes(feature)
  }

  async getCapabilities(
    userId: string,
  ): Promise<Record<PlanFeature, boolean>> {
    const plan = await this.getActivePlan(userId)
    const enabled = plan?.features ?? []
    return buildCapabilitiesMap(enabled)
  }

  hasFeatureInPlan(plan: ResolvedPlan | null, feature: PlanFeature): boolean {
    if (!plan) return false
    return plan.features.includes(feature)
  }

  static allFeaturesDisabled(): Record<PlanFeature, boolean> {
    return buildCapabilitiesMap([])
  }

  static allFeatureKeys(): readonly PlanFeature[] {
    return ALL_PLAN_FEATURES
  }
}
