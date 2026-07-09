export type PlanBillingInfo = {
  id: string
  slug: string
  name: string
  order: number
  amountCents: number
}

export type ActiveSubscriptionBilling = {
  id: string
  planId: string
  startsAt: Date
  endsAt: Date
  plan: PlanBillingInfo
}

export type BillingState = {
  activeSubscription: ActiveSubscriptionBilling | null
  currentPlan: PlanBillingInfo | null
  currentOrder: number
}

export type UpgradeRejectionReason =
  | 'invalid_plan'
  | 'already_on_plan'
  | 'downgrade_not_allowed'
  | 'ambiguous_plan_tier'
  | 'subscription_ending_soon'
  | 'invalid_upgrade_amount'

export type UpgradeEligibility =
  | { ok: false; reason: UpgradeRejectionReason }
  | {
      ok: true
      mode: 'purchase'
      targetPlan: PlanBillingInfo
      amountDueCents: number
      listPriceCents: number
    }
  | {
      ok: true
      mode: 'upgrade'
      targetPlan: PlanBillingInfo
      currentPlan: PlanBillingInfo
      activeSubscription: ActiveSubscriptionBilling
      amountDueCents: number
      listPriceCents: number
      daysRemaining: number
      totalDays: number
      currentRemainingCents: number
      targetRemainingCents: number
      preservedEndsAt: Date
    }
