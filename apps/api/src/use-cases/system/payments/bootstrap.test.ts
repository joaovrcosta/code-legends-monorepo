import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { PaymentProvider, PrismaClient } from '@prisma/client'
import { BootstrapPaymentSettingsUseCase } from './bootstrap'
import type { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'

vi.mock('../../../lib/payment-provider-seed', () => ({
  seedPaymentProviders: vi.fn(),
}))

vi.mock('../../../env/index', () => ({
  env: {
    ABACATE_PAY_API_KEY: undefined,
    ABACATE_PAY_WEBHOOK_SECRET: undefined,
  },
}))

const activeProvider: PaymentProvider = {
  id: 'prov_1',
  name: 'Abacate Pay',
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

describe('BootstrapPaymentSettingsUseCase', () => {
  let repo: IPaymentProviderRepository
  let prisma: PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
    repo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findByGatewayCode: vi.fn(),
      findDefault: vi.fn().mockResolvedValue(activeProvider),
      list: vi.fn(),
      listActiveOrDeprecated: vi.fn(),
      countCustom: vi.fn(),
      clearDefaultExcept: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      createAuditLog: vi.fn(),
    }
    prisma = {} as PrismaClient
  })

  it('succeeds without api key and returns checkoutReady false', async () => {
    const { seedPaymentProviders } = await import(
      '../../../lib/payment-provider-seed'
    )

    const useCase = new BootstrapPaymentSettingsUseCase(prisma, repo)
    const result = await useCase.execute({ actorId: 'admin_1' })

    expect(seedPaymentProviders).toHaveBeenCalledWith(prisma)
    expect(result.settings.providerRegistered).toBe(true)
    expect(result.settings.checkoutReady).toBe(false)
  })

  it('can be called multiple times without error', async () => {
    const { seedPaymentProviders } = await import(
      '../../../lib/payment-provider-seed'
    )

    const useCase = new BootstrapPaymentSettingsUseCase(prisma, repo)
    await useCase.execute({ actorId: 'admin_1' })
    await useCase.execute({ actorId: 'admin_1' })

    expect(seedPaymentProviders).toHaveBeenCalledTimes(2)
  })

  it('propagates seed failures', async () => {
    const { seedPaymentProviders } = await import(
      '../../../lib/payment-provider-seed'
    )
    vi.mocked(seedPaymentProviders).mockRejectedValueOnce(
      new Error('db unavailable'),
    )

    const useCase = new BootstrapPaymentSettingsUseCase(prisma, repo)

    await expect(
      useCase.execute({ actorId: 'admin_1' }),
    ).rejects.toThrow('db unavailable')
  })
})
