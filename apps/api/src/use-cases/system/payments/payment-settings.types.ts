import type { PaymentProvider, PaymentProviderMethod } from '@prisma/client'

export type PaymentSettingsDto = {
  handlerKey: string
  name: string
  slug: string
  status: PaymentProvider['status'] | null
  supportedMethods: PaymentProviderMethod[]
  providerRegistered: boolean
  credentials: {
    apiKeyConfigured: boolean
    webhookSecretConfigured: boolean
  }
  checkoutReady: boolean
}

export type PaymentSettingsResponse = {
  settings: PaymentSettingsDto
}
