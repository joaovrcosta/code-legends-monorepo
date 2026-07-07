import type { PaymentProviderHandlerKey } from '@code-legends/payment-providers'
import { env } from '../env'

export interface PaymentProviderCredentials {
  getApiKey: () => string
  getWebhookSecret: () => string
}

export function getPaymentProviderCredentials(
  handlerKey: PaymentProviderHandlerKey,
): PaymentProviderCredentials {
  switch (handlerKey) {
    case 'abacate':
      return {
        getApiKey: () => {
          const key = env.ABACATE_PAY_API_KEY
          if (!key) {
            throw new Error('ABACATE_PAY_API_KEY not configured')
          }
          return key
        },
        getWebhookSecret: () => {
          const secret = env.ABACATE_PAY_WEBHOOK_SECRET
          if (!secret) {
            throw new Error('ABACATE_PAY_WEBHOOK_SECRET not configured')
          }
          return secret
        },
      }
    default:
      throw new Error(`No credentials configured for handler: ${handlerKey}`)
  }
}

export function hasPaymentProviderCredentials(
  handlerKey: PaymentProviderHandlerKey,
): boolean {
  if (handlerKey === 'abacate') {
    return Boolean(env.ABACATE_PAY_API_KEY)
  }
  return false
}
