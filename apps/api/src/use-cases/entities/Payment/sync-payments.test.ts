import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SyncPaymentsUseCase } from './sync-payments'
import { HandlePaymentPaidUseCase } from './handle-payment-paid'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('../../../lib/payment-provider-credentials', () => ({
  hasPaymentProviderCredentials: vi.fn(() => true),
  getPaymentProviderCredentials: vi.fn(() => ({
    getApiKey: () => 'test-key',
    getWebhookSecret: () => 'test-secret',
  })),
}))

vi.mock('@code-legends/payment-providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@code-legends/payment-providers')>()
  return {
    ...actual,
    getSyncHandler: vi.fn(() => ({
      listRemotePayments: vi.fn(async () => [
        { gatewayPaymentId: 'bill_1', status: 'PAID' },
      ]),
    })),
    resolveHandlerKeyFromGatewayCode: vi.fn((code: string) =>
      code === 'ABACATE_PAY' ? 'abacate' : null,
    ),
    isSyncCapableHandlerKey: vi.fn(() => true),
  }
})

import { prisma } from '../../../lib/prisma'

describe('SyncPaymentsUseCase', () => {
  let repo: IPaymentProviderRepository
  let handlePaid: HandlePaymentPaidUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    repo = {
      findDistinctPendingGateways: vi.fn().mockResolvedValue(['ABACATE_PAY']),
      listActiveOrDeprecated: vi.fn().mockResolvedValue([
        {
          id: 'p1',
          gatewayCode: 'ABACATE_PAY',
          handlerKey: 'abacate',
          status: 'ACTIVE',
        },
      ]),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findByGatewayCode: vi.fn(),
      findDefault: vi.fn(),
      list: vi.fn(),
      countCustom: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      clearDefaultExcept: vi.fn(),
      createAuditLog: vi.fn(),
    }
    handlePaid = { execute: vi.fn().mockResolvedValue({ ok: true }) } as unknown as HandlePaymentPaidUseCase
  })

  it('syncs pending payments from rule A', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      {
        id: 'pay_1',
        status: 'PENDING',
        gatewayPaymentId: 'bill_1',
      },
    ] as never)

    const useCase = new SyncPaymentsUseCase(repo, handlePaid)
    const { updated } = await useCase.execute()

    expect(updated).toBe(1)
    expect(handlePaid.execute).toHaveBeenCalledWith({
      gatewayPaymentId: 'bill_1',
      gateway: 'ABACATE_PAY',
    })
  })

  it('skips gateway without handler with log', async () => {
    const { resolveHandlerKeyFromGatewayCode } = await import(
      '@code-legends/payment-providers'
    )
    vi.mocked(resolveHandlerKeyFromGatewayCode).mockReturnValue(null)

    const warn = vi.fn()
    const useCase = new SyncPaymentsUseCase(repo, handlePaid, { warn })
    const { updated } = await useCase.execute()

    expect(updated).toBe(0)
    expect(warn).toHaveBeenCalled()
  })
})
