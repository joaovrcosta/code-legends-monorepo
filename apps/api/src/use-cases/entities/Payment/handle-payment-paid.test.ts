import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HandlePaymentPaidUseCase } from './handle-payment-paid'

vi.mock('../../../lib/prisma', () => {
  const payment = {
    id: 'pay_1',
    userId: 'user_1',
    plan: 'PRO',
    status: 'PENDING',
  }
  return {
    prisma: {
      payment: {
        findFirst: vi.fn().mockResolvedValue(payment),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
        const tx = {
          payment: { update: vi.fn() },
          user: { update: vi.fn() },
          subscription: { create: vi.fn() },
        }
        await fn(tx)
      }),
    },
  }
})

import { prisma } from '../../../lib/prisma'

describe('HandlePaymentPaidUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('processes payment idempotently when already paid', async () => {
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      id: 'pay_1',
      userId: 'user_1',
      plan: 'PRO',
      status: 'PAID',
    } as never)

    const useCase = new HandlePaymentPaidUseCase()
    const result = await useCase.execute({
      gatewayPaymentId: 'bill_1',
      gateway: 'ABACATE_PAY',
    })

    expect(result).toEqual({ ok: true, reason: 'already_paid' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns not found when payment missing', async () => {
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(null)

    const useCase = new HandlePaymentPaidUseCase()
    const result = await useCase.execute({
      gatewayPaymentId: 'missing',
      gateway: 'ABACATE_PAY',
    })

    expect(result).toEqual({ ok: false, reason: 'payment_not_found' })
  })
})
