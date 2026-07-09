import { describe, expect, it } from 'vitest'
import { validateUpgradeEligibility } from './validate-upgrade-eligibility'
import type { BillingState, PlanBillingInfo } from './types'

function plan(
  id: string,
  order: number,
  amountCents: number,
  name = id,
): PlanBillingInfo {
  return { id, slug: id.toUpperCase(), name, order, amountCents }
}

const basic = plan('plan_basic', 1, 10000, 'Basic')
const plus = plan('plan_plus', 2, 30000, 'Plus')

describe('validateUpgradeEligibility', () => {
  const freeBilling: BillingState = {
    activeSubscription: null,
    currentPlan: null,
    currentOrder: 0,
  }

  it('permite compra integral sem assinatura ativa', () => {
    const result = validateUpgradeEligibility(freeBilling, basic)
    expect(result).toMatchObject({
      ok: true,
      mode: 'purchase',
      amountDueCents: 10000,
    })
  })

  it('bloqueia downgrade', () => {
    const billing: BillingState = {
      currentOrder: 2,
      currentPlan: plus,
      activeSubscription: {
        id: 'sub_1',
        planId: plus.id,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2027-01-01'),
        plan: plus,
      },
    }

    const result = validateUpgradeEligibility(billing, basic)
    expect(result).toEqual({ ok: false, reason: 'downgrade_not_allowed' })
  })

  it('bloqueia mesmo plano', () => {
    const billing: BillingState = {
      currentOrder: 1,
      currentPlan: basic,
      activeSubscription: {
        id: 'sub_1',
        planId: basic.id,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2027-01-01'),
        plan: basic,
      },
    }

    const result = validateUpgradeEligibility(billing, basic)
    expect(result).toEqual({ ok: false, reason: 'already_on_plan' })
  })

  it('bloqueia tier ambíguo com mesmo order', () => {
    const otherBasic = plan('plan_basic_b', 1, 12000, 'Basic B')
    const billing: BillingState = {
      currentOrder: 1,
      currentPlan: basic,
      activeSubscription: {
        id: 'sub_1',
        planId: basic.id,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2027-01-01'),
        plan: basic,
      },
    }

    const result = validateUpgradeEligibility(billing, otherBasic)
    expect(result).toEqual({ ok: false, reason: 'ambiguous_plan_tier' })
  })

  it('permite upgrade com order maior', () => {
    const billing: BillingState = {
      currentOrder: 1,
      currentPlan: basic,
      activeSubscription: {
        id: 'sub_1',
        planId: basic.id,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2027-01-01'),
        plan: basic,
      },
    }

    const result = validateUpgradeEligibility(billing, plus)
    expect(result.ok).toBe(true)
    if (!result.ok || result.mode !== 'upgrade') return
    expect(result.amountDueCents).toBeGreaterThan(0)
    expect(result.amountDueCents).toBeLessThan(plus.amountCents)
  })
})
