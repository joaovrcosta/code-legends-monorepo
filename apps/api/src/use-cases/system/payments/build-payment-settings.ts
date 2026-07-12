import { BUILTIN_PAYMENT_PROVIDER_SEEDS } from '@code-legends/payment-providers'
import type { PaymentProvider } from '@prisma/client'
import { env } from '../../../env'
import type { PaymentSettingsResponse } from './payment-settings.types'

const DEFAULT_SEED = BUILTIN_PAYMENT_PROVIDER_SEEDS[0]

export function buildPaymentSettingsResponse(
  provider: PaymentProvider | null,
): PaymentSettingsResponse {
  const apiKeyConfigured = Boolean(env.ABACATE_PAY_API_KEY)
  const webhookSecretConfigured = Boolean(env.ABACATE_PAY_WEBHOOK_SECRET)
  const providerRegistered =
    provider !== null && provider.status !== 'DISABLED'

  return {
    settings: {
      handlerKey: provider?.handlerKey ?? DEFAULT_SEED.handlerKey,
      name: provider?.name ?? DEFAULT_SEED.name,
      slug: provider?.slug ?? DEFAULT_SEED.slug,
      status: provider?.status ?? null,
      supportedMethods:
        provider?.supportedMethods ?? [...DEFAULT_SEED.supportedMethods],
      providerRegistered,
      credentials: {
        apiKeyConfigured,
        webhookSecretConfigured,
      },
      checkoutReady: providerRegistered && apiKeyConfigured,
    },
  }
}
