import type { PlanFeature } from '@code-legends/plans'

export type ResolvedPlan = {
  id: string
  slug: string
  name: string
  features: PlanFeature[]
  amountCents: number
  imageUrl: string | null
  colorHex: string | null
}

export interface PlanAccessPort {
  hasFeature(userId: string, feature: PlanFeature): Promise<boolean>
  getActivePlan(userId: string): Promise<ResolvedPlan | null>
  getCapabilities(userId: string): Promise<Record<PlanFeature, boolean>>
}
