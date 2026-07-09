const DAY_MS = 24 * 60 * 60 * 1000

export type ProrationInput = {
  currentAmountCents: number
  targetAmountCents: number
  startsAt: Date
  endsAt: Date
  now?: Date
}

export type ProrationResult = {
  amountDueCents: number
  daysRemaining: number
  totalDays: number
  currentRemainingCents: number
  targetRemainingCents: number
  preservedEndsAt: Date
}

export type ProrationError =
  | 'subscription_ending_soon'
  | 'invalid_upgrade_amount'

export function calculateProratedUpgrade(
  input: ProrationInput,
): ProrationResult | { error: ProrationError } {
  const now = input.now ?? new Date()
  const totalDays = Math.max(
    1,
    Math.ceil((input.endsAt.getTime() - input.startsAt.getTime()) / DAY_MS),
  )
  const daysRemaining = Math.max(
    0,
    Math.ceil((input.endsAt.getTime() - now.getTime()) / DAY_MS),
  )

  if (daysRemaining === 0) {
    return { error: 'subscription_ending_soon' }
  }

  const currentRemaining =
    (input.currentAmountCents / totalDays) * daysRemaining
  const targetRemaining = (input.targetAmountCents / totalDays) * daysRemaining
  let amountDueCents = Math.round(targetRemaining - currentRemaining)

  if (amountDueCents <= 0) {
    return { error: 'invalid_upgrade_amount' }
  }

  if (amountDueCents < 1) {
    amountDueCents = 1
  }

  return {
    amountDueCents,
    daysRemaining,
    totalDays,
    currentRemainingCents: Math.round(currentRemaining),
    targetRemainingCents: Math.round(targetRemaining),
    preservedEndsAt: input.endsAt,
  }
}
