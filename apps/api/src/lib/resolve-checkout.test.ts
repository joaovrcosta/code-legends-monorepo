import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PaymentProvider } from '@prisma/client'
import { PaymentProviderNotFoundError } from '../use-cases/errors/payment-provider-not-found'
import {
  resolveCheckoutHandler,
  resolvePaymentProvider,
  validatePaymentProviderRegistry,
} from './resolve-checkout'
import { IPaymentProviderRepository } from '../repositories/payment-provider-repository'

describe('validatePaymentProviderRegistry', () => {
  it('passes for builtin seeds', () => {
    expect(() => validatePaymentProviderRegistry()).not.toThrow()
  })
})

describe('resolvePaymentProvider', () => {
  const activeProvider: PaymentProvider = {
    id: 'prov_1',
    name: 'Abacate',
    slug: 'abacate',
    handlerKey: 'abacate',
    gatewayCode: 'ABACATE_PAY',
    status: 'ACTIVE',
    isDefault: true,
    isBuiltin: true,
    supportedMethods: ['CARD'],
    sortOrder: 0,
    helpText: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  let repo: IPaymentProviderRepository

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findByGatewayCode: vi.fn(),
      findDefault: vi.fn(),
      list: vi.fn(),
      listActiveOrDeprecated: vi.fn(),
      findDistinctPendingGateways: vi.fn(),
      countCustom: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      clearDefaultExcept: vi.fn(),
      createAuditLog: vi.fn(),
    }
  })

  it('resolves default provider', async () => {
    vi.mocked(repo.findDefault).mockResolvedValue(activeProvider)
    const provider = await resolvePaymentProvider({
      paymentProviderRepository: repo,
    })
    expect(provider.id).toBe('prov_1')
    expect(resolveCheckoutHandler(provider).gatewayCode).toBe('ABACATE_PAY')
  })

  it('rejects disabled provider', async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...activeProvider,
      status: 'DISABLED',
    })
    await expect(
      resolvePaymentProvider({
        providerId: 'prov_1',
        paymentProviderRepository: repo,
      }),
    ).rejects.toBeInstanceOf(PaymentProviderNotFoundError)
  })
})
