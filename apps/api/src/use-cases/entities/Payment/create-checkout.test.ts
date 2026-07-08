import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { PaymentProviderHandler } from '@code-legends/payment-providers'
import { CreateCheckoutUseCase } from './create-checkout'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    plan: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    payment: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('../../../lib/resolve-checkout', () => ({
  resolvePaymentProvider: vi.fn(),
  resolveCheckoutHandler: vi.fn(),
}))

vi.mock('../../../lib/payment-provider-credentials', () => ({
  hasPaymentProviderCredentials: vi.fn(() => true),
  getPaymentProviderCredentials: vi.fn(() => ({
    getApiKey: () => 'test-key',
    getWebhookSecret: () => 'test-secret',
  })),
}))

import { prisma } from '../../../lib/prisma'
import {
  resolveCheckoutHandler,
  resolvePaymentProvider,
} from '../../../lib/resolve-checkout'

describe('CreateCheckoutUseCase', () => {
  const mockHandler: PaymentProviderHandler = {
    handlerKey: 'abacate',
    gatewayCode: 'ABACATE_PAY',
    supportedMethods: ['CARD'],
    createCheckout: vi.fn(async () => ({
      gatewayPaymentId: 'bill_1',
      checkoutUrl: 'https://checkout.example/pay',
    })),
  }

  const repo = {} as IPaymentProviderRepository

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolvePaymentProvider).mockResolvedValue({
      id: 'prov_1',
      handlerKey: 'abacate',
      gatewayCode: 'ABACATE_PAY',
    } as never)
    vi.mocked(resolveCheckoutHandler).mockReturnValue(mockHandler)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan_premium',
      slug: 'PREMIUM',
      amountCents: 39700,
      name: 'Premium',
      productName: 'Code Legends PREMIUM',
      externalId: 'CODE-LEGENDS-PREMIUM',
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_1',
      name: 'João',
      fullname: 'João Victor Costa',
      email: 'user@example.com',
      phone: '11999999999',
      document: '52998224725',
      Address: {
        postal_code: '03572-000',
        street_name: 'Rua A',
        number: '1668',
        complement: 'Casa',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR',
      },
    } as never)
    vi.mocked(prisma.payment.create).mockResolvedValue({ id: 'pay_1' } as never)
    vi.mocked(prisma.payment.update).mockResolvedValue({ id: 'pay_1' } as never)
  })

  it('passes neutral customer to handler without Abacate-specific fields', async () => {
    const useCase = new CreateCheckoutUseCase(repo)

    const result = await useCase.execute({
      userId: 'user_1',
      planSlug: 'premium',
      returnUrl: 'http://localhost:3000/cart/premium',
      completionUrl: 'http://localhost:3000/',
    })

    expect(result).toEqual({
      ok: true,
      checkoutUrl: 'https://checkout.example/pay',
      paymentId: 'pay_1',
    })

    expect(mockHandler.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: {
          email: 'user@example.com',
          name: 'João Victor Costa',
          cellphone: '11999999999',
          taxId: '52998224725',
          address: {
            postalCode: '03572-000',
            street: 'Rua A',
            number: '1668',
            complement: 'Casa',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            country: 'BR',
          },
        },
      }),
    )

    const callArg = vi.mocked(mockHandler.createCheckout).mock.calls[0][0]
    expect(callArg.customer).not.toHaveProperty('zipCode')
  })
})
