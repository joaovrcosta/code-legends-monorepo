import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { PaymentProvider } from '@prisma/client'
import { GetPaymentSettingsUseCase } from './get-settings'
import type { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'

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

describe('GetPaymentSettingsUseCase', () => {
  let repo: IPaymentProviderRepository

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findByGatewayCode: vi.fn(),
      findDefault: vi.fn(),
      list: vi.fn(),
      listActiveOrDeprecated: vi.fn(),
      countCustom: vi.fn(),
      clearDefaultExcept: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      createAuditLog: vi.fn(),
    }
  })

  it('returns providerRegistered false when no default provider', async () => {
    vi.mocked(repo.findDefault).mockResolvedValue(null)

    const useCase = new GetPaymentSettingsUseCase(repo)
    const result = await useCase.execute()

    expect(result.settings.providerRegistered).toBe(false)
    expect(result.settings.checkoutReady).toBe(false)
    expect(result.settings.slug).toBe('abacate')
  })

  it('returns checkoutReady true when provider and api key exist', async () => {
    const { env } = await import('../../../env/index')
    vi.mocked(repo.findDefault).mockResolvedValue(activeProvider)
    ;(env as { ABACATE_PAY_API_KEY?: string }).ABACATE_PAY_API_KEY = 'key_test'

    const useCase = new GetPaymentSettingsUseCase(repo)
    const result = await useCase.execute()

    expect(result.settings.providerRegistered).toBe(true)
    expect(result.settings.credentials.apiKeyConfigured).toBe(true)
    expect(result.settings.checkoutReady).toBe(true)
  })
})
