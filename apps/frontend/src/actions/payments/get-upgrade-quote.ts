'use server'

import { getAuthToken } from '../auth/session'

const API_TIMEOUT_MS = 90_000

export type UpgradeQuotePlan = {
  id: string
  slug: string
  name: string
  order: number
  amountCents: number
}

export type UpgradeQuote =
  | {
      ok: true
      kind: 'purchase'
      targetPlan: UpgradeQuotePlan
      listPriceCents: number
      amountDueCents: number
    }
  | {
      ok: true
      kind: 'upgrade'
      targetPlan: UpgradeQuotePlan
      currentPlan: UpgradeQuotePlan
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

export type GetUpgradeQuoteResult =
  | UpgradeQuote
  | { ok: false; message: string; reason?: string }

export async function getUpgradeQuote(
  planSlug: string,
): Promise<GetUpgradeQuoteResult> {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { ok: false, message: 'Faça login para continuar' }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    const params = new URLSearchParams({ plan: planSlug })
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/upgrade-quote?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal,
      },
    )
    clearTimeout(timeoutId)

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ok: false,
        message: data.message ?? 'Não foi possível calcular o valor do plano',
        reason: data.reason,
      }
    }

    return { ok: true, ...data } as UpgradeQuote
  } catch (error) {
    console.error('getUpgradeQuote error:', error)
    const isAbort = error instanceof Error && error.name === 'AbortError'
    return {
      ok: false,
      message: isAbort
        ? 'A requisição demorou muito. Tente novamente em alguns segundos.'
        : 'Erro ao calcular valor do plano',
    }
  }
}
