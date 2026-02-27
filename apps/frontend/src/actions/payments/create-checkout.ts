'use server'

import { getAuthToken } from '../auth/session'

/** Timeout para cold start da API (ex.: Render ~50s). */
const API_TIMEOUT_MS = 90_000

export type CreateCheckoutResult =
  | { success: true; checkoutUrl: string; paymentId: string }
  | { success: false; message: string }

export async function createCheckout(
  planSlug: string,
  options?: { returnUrl?: string; completionUrl?: string },
): Promise<CreateCheckoutResult> {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { success: false, message: 'Faça login para continuar' }
    }

    const body: { plan: string; returnUrl?: string; completionUrl?: string } = {
      plan: planSlug,
    }
    if (options?.returnUrl) body.returnUrl = options.returnUrl
    if (options?.completionUrl) body.completionUrl = options.completionUrl

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
      },
    )
    clearTimeout(timeoutId)

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? 'Não foi possível criar o checkout',
      }
    }

    if (!data.checkoutUrl || typeof data.checkoutUrl !== 'string') {
      return {
        success: false,
        message:
          data.message ?? 'Resposta inválida do servidor. Tente novamente.',
      }
    }

    return {
      success: true,
      checkoutUrl: data.checkoutUrl,
      paymentId: data.paymentId ?? '',
    }
  } catch (error) {
    console.error('createCheckout error:', error)
    const isAbort = error instanceof Error && error.name === 'AbortError'
    return {
      success: false,
      message: isAbort
        ? 'A requisição demorou muito. A API pode estar iniciando; tente novamente em alguns segundos.'
        : error instanceof Error
          ? error.message
          : 'Erro ao criar checkout',
    }
  }
}
