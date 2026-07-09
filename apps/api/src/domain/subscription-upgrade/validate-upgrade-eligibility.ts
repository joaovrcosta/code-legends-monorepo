import { calculateProratedUpgrade } from './calculate-prorated-upgrade'
import type {
  BillingState,
  PlanBillingInfo,
  UpgradeEligibility,
} from './types'

export function validateUpgradeEligibility(
  billing: BillingState,
  targetPlan: PlanBillingInfo,
): UpgradeEligibility {
  if (targetPlan.amountCents <= 0) {
    return { ok: false, reason: 'invalid_plan' }
  }

  const { activeSubscription, currentPlan, currentOrder } = billing

  if (!activeSubscription || !currentPlan) {
    return {
      ok: true,
      mode: 'purchase',
      targetPlan,
      amountDueCents: targetPlan.amountCents,
      listPriceCents: targetPlan.amountCents,
    }
  }

  if (targetPlan.id === currentPlan.id) {
    return { ok: false, reason: 'already_on_plan' }
  }

  if (targetPlan.order === currentOrder) {
    return { ok: false, reason: 'ambiguous_plan_tier' }
  }

  if (targetPlan.order < currentOrder) {
    return { ok: false, reason: 'downgrade_not_allowed' }
  }

  const proration = calculateProratedUpgrade({
    currentAmountCents: currentPlan.amountCents,
    targetAmountCents: targetPlan.amountCents,
    startsAt: activeSubscription.startsAt,
    endsAt: activeSubscription.endsAt,
  })

  if ('error' in proration) {
    return { ok: false, reason: proration.error }
  }

  return {
    ok: true,
    mode: 'upgrade',
    targetPlan,
    currentPlan,
    activeSubscription,
    amountDueCents: proration.amountDueCents,
    listPriceCents: targetPlan.amountCents,
    daysRemaining: proration.daysRemaining,
    totalDays: proration.totalDays,
    currentRemainingCents: proration.currentRemainingCents,
    targetRemainingCents: proration.targetRemainingCents,
    preservedEndsAt: proration.preservedEndsAt,
  }
}
