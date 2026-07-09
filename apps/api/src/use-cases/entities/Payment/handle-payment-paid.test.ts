import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HandlePaymentPaidUseCase } from './handle-payment-paid'

const preservedEndsAt = '2027-06-01T00:00:00.000Z'

vi.mock('../../../lib/prisma', () => {
  const payment = {
    id: 'pay_1',
    userId: 'user_1',
    planId: 'plan_plus',
    status: 'PENDING',
    metadata: null,
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
          plan: { findUnique: vi.fn().mockResolvedValue({ order: 2 }) },
          subscription: {
            update: vi.fn(),
            updateMany: vi.fn(),
            create: vi.fn(),
          },
        }
        await fn(tx)
        return tx
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
      planId: 'plan_plus',
      status: 'PAID',
      metadata: null,
    } as never)

    const useCase = new HandlePaymentPaidUseCase()
    const result = await useCase.execute({
      gatewayPaymentId: 'bill_1',
      gateway: 'ABACATE_PAY',
    })

    expect(result).toEqual({ ok: true, reason: 'already_paid' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('cria assinatura de 1 ano em compra nova', async () => {
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      id: 'pay_1',
      userId: 'user_1',
      planId: 'plan_plus',
      status: 'PENDING',
      metadata: null,
    } as never)

    let txRef: {
      subscription: { create: ReturnType<typeof vi.fn> }
    }
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        payment: { update: vi.fn() },
        user: { update: vi.fn() },
        plan: { findUnique: vi.fn() },
        subscription: {
          update: vi.fn(),
          updateMany: vi.fn(),
          create: vi.fn(),
        },
      }
      txRef = tx
      await fn(tx)
      return tx
    })

    const useCase = new HandlePaymentPaidUseCase()
    await useCase.execute({
      gatewayPaymentId: 'bill_1',
      gateway: 'ABACATE_PAY',
    })

    expect(txRef!.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: 'plan_plus',
          status: 'ACTIVE',
        }),
      }),
    )
  })

  it('upgrade cancela sub anterior e preserva endsAt', async () => {
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      id: 'pay_1',
      userId: 'user_1',
      planId: 'plan_plus',
      status: 'PENDING',
      metadata: {
        kind: 'upgrade',
        fromSubscriptionId: 'sub_basic',
        fromPlanId: 'plan_basic',
        toPlanId: 'plan_plus',
        preservedEndsAt,
        listPriceCents: 30000,
        amountDueCents: 9500,
        daysRemaining: 180,
      },
    } as never)

    let txRef: {
      subscription: {
        update: ReturnType<typeof vi.fn>
        updateMany: ReturnType<typeof vi.fn>
        create: ReturnType<typeof vi.fn>
      }
    }
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        payment: { update: vi.fn() },
        user: { update: vi.fn() },
        plan: { findUnique: vi.fn().mockResolvedValue({ order: 2 }) },
        subscription: {
          update: vi.fn(),
          updateMany: vi.fn(),
          create: vi.fn(),
        },
      }
      txRef = tx
      await fn(tx)
      return tx
    })

    const useCase = new HandlePaymentPaidUseCase()
    await useCase.execute({
      gatewayPaymentId: 'bill_1',
      gateway: 'ABACATE_PAY',
    })

    expect(txRef!.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub_basic' },
      data: { status: 'CANCELLED' },
    })
    expect(txRef!.subscription.updateMany).toHaveBeenCalled()
    expect(txRef!.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planId: 'plan_plus',
        endsAt: new Date(preservedEndsAt),
      }),
    })
  })
})
