export const UPGRADE_PAYMENT_KIND = 'upgrade' as const

export type UpgradePaymentMetadata = {
  kind: typeof UPGRADE_PAYMENT_KIND
  fromSubscriptionId: string
  fromPlanId: string
  toPlanId: string
  preservedEndsAt: string
  listPriceCents: number
  amountDueCents: number
  daysRemaining: number
}

export function isUpgradePaymentMetadata(
  value: unknown,
): value is UpgradePaymentMetadata {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    record.kind === UPGRADE_PAYMENT_KIND &&
    typeof record.fromSubscriptionId === 'string' &&
    typeof record.fromPlanId === 'string' &&
    typeof record.toPlanId === 'string' &&
    typeof record.preservedEndsAt === 'string' &&
    typeof record.listPriceCents === 'number' &&
    typeof record.amountDueCents === 'number' &&
    typeof record.daysRemaining === 'number'
  )
}
