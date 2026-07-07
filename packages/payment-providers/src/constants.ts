import type { BuiltinPaymentProviderSeed } from './types'

export const BUILTIN_PAYMENT_PROVIDER_SEEDS: BuiltinPaymentProviderSeed[] = [
  {
    slug: 'abacate',
    name: 'Abacate Pay',
    handlerKey: 'abacate',
    gatewayCode: 'ABACATE_PAY',
    supportedMethods: ['CARD'],
    isDefault: true,
    sortOrder: 0,
    helpText: 'Gateway brasileiro com checkout hospedado (cartão e PIX).',
  },
]

export const WEBHOOK_SECRET_HEADER = 'X-Webhook-Secret'
