import {
  assertRegistryIntegrity,
  BUILTIN_PAYMENT_PROVIDER_SEEDS,
  getCheckoutHandler,
  type PaymentProviderHandlerKey,
} from '@code-legends/payment-providers'
import { PaymentProvider } from '@prisma/client'
import { IPaymentProviderRepository } from '../repositories/payment-provider-repository'
import { PaymentProviderNotFoundError } from '../use-cases/errors/payment-provider-not-found'

export function validatePaymentProviderRegistry(): void {
  assertRegistryIntegrity(BUILTIN_PAYMENT_PROVIDER_SEEDS)
}

export async function resolvePaymentProvider(params: {
  providerId?: string | null
  paymentProviderRepository: IPaymentProviderRepository
}): Promise<PaymentProvider> {
  const { providerId, paymentProviderRepository } = params

  let provider: PaymentProvider | null = null

  if (providerId) {
    provider = await paymentProviderRepository.findById(providerId)
  } else {
    provider = await paymentProviderRepository.findDefault()
  }

  if (!provider) {
    throw new PaymentProviderNotFoundError()
  }

  if (provider.status === 'DISABLED') {
    throw new PaymentProviderNotFoundError()
  }

  const handlerKey = provider.handlerKey as PaymentProviderHandlerKey
  getCheckoutHandler(handlerKey)

  return provider
}

export function resolveCheckoutHandler(provider: PaymentProvider) {
  return getCheckoutHandler(provider.handlerKey as PaymentProviderHandlerKey)
}
