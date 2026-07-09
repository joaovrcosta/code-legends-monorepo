import { prisma } from '../../../lib/prisma'
import {
  resolveBillingState,
  validateUpgradeEligibility,
  type PlanBillingInfo,
  type UpgradeRejectionReason,
} from '../../../domain/subscription-upgrade'

export type GetUpgradeQuoteInput = {
  userId: string
  planSlug: string
}

export type GetUpgradeQuoteResult =
  | {
      ok: true
      kind: 'purchase'
      targetPlan: PlanBillingInfo
      listPriceCents: number
      amountDueCents: number
    }
  | {
      ok: true
      kind: 'upgrade'
      targetPlan: PlanBillingInfo
      currentPlan: PlanBillingInfo
      listPriceCents: number
      amountDueCents: number
      daysRemaining: number
      preservedEndsAt: string
      breakdown: {
        currentRemainingCents: number
        targetRemainingCents: number
        creditCents: number
      }
    }
  | { ok: false; reason: UpgradeRejectionReason | 'invalid_plan' }

function toPlanBillingInfo(plan: {
  id: string
  slug: string
  name: string
  order: number
  amountCents: number
}): PlanBillingInfo {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    order: plan.order,
    amountCents: plan.amountCents,
  }
}

export class GetUpgradeQuoteUseCase {
  async execute(input: GetUpgradeQuoteInput): Promise<GetUpgradeQuoteResult> {
    const slug = input.planSlug?.toUpperCase()
    const targetFromDb = await prisma.plan.findUnique({
      where: { slug, active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        amountCents: true,
      },
    })

    if (!targetFromDb || targetFromDb.amountCents <= 0) {
      return { ok: false, reason: 'invalid_plan' }
    }

    const targetPlan = toPlanBillingInfo(targetFromDb)
    const billing = await resolveBillingState(input.userId)
    const eligibility = validateUpgradeEligibility(billing, targetPlan)

    if (!eligibility.ok) {
      return { ok: false, reason: eligibility.reason }
    }

    if (eligibility.mode === 'purchase') {
      return {
        ok: true,
        kind: 'purchase',
        targetPlan: eligibility.targetPlan,
        listPriceCents: eligibility.listPriceCents,
        amountDueCents: eligibility.amountDueCents,
      }
    }

    return {
      ok: true,
      kind: 'upgrade',
      targetPlan: eligibility.targetPlan,
      currentPlan: eligibility.currentPlan,
      listPriceCents: eligibility.listPriceCents,
      amountDueCents: eligibility.amountDueCents,
      daysRemaining: eligibility.daysRemaining,
      preservedEndsAt: eligibility.preservedEndsAt.toISOString(),
      breakdown: {
        currentRemainingCents: eligibility.currentRemainingCents,
        targetRemainingCents: eligibility.targetRemainingCents,
        creditCents: eligibility.currentRemainingCents,
      },
    }
  }
}
