import { describe, expect, it } from 'vitest'
import { calculateProratedUpgrade } from './calculate-prorated-upgrade'

const DAY_MS = 24 * 60 * 60 * 1000

describe('calculateProratedUpgrade', () => {
  const startsAt = new Date('2026-01-01T00:00:00Z')
  const endsAt = new Date('2027-01-01T00:00:00Z')

  it('calcula diferença proporcional para metade do período', () => {
    const now = new Date(startsAt.getTime() + 182 * DAY_MS)
    const result = calculateProratedUpgrade({
      currentAmountCents: 10000,
      targetAmountCents: 30000,
      startsAt,
      endsAt,
      now,
    })

    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.daysRemaining).toBeGreaterThan(180)
    expect(result.amountDueCents).toBeGreaterThan(9000)
    expect(result.amountDueCents).toBeLessThan(11000)
    expect(result.preservedEndsAt).toEqual(endsAt)
  })

  it('rejeita quando não há dias restantes', () => {
    const result = calculateProratedUpgrade({
      currentAmountCents: 10000,
      targetAmountCents: 30000,
      startsAt,
      endsAt,
      now: endsAt,
    })

    expect(result).toEqual({ error: 'subscription_ending_soon' })
  })

  it('rejeita quando diferença arredondada é zero ou negativa', () => {
    const now = new Date(startsAt.getTime() + 10 * DAY_MS)
    const result = calculateProratedUpgrade({
      currentAmountCents: 30000,
      targetAmountCents: 10000,
      startsAt,
      endsAt,
      now,
    })

    expect(result).toEqual({ error: 'invalid_upgrade_amount' })
  })
})
