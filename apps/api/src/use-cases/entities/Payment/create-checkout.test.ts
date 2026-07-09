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
    subscription: { findMany: vi.fn() },
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

vi.mock('../../../domain/subscription-upgrade/resolve-billing-state', () => ({
  resolveBillingState: vi.fn(),
}))

vi.mock('../../../domain/subscription-upgrade/validate-upgrade-eligibility', () => ({
  validateUpgradeEligibility: vi.fn(),
}))

import { prisma } from '../../../lib/prisma'
import {
  resolveCheckoutHandler,
  resolvePaymentProvider,
} from '../../../lib/resolve-checkout'
import { resolveBillingState } from '../../../domain/subscription-upgrade/resolve-billing-state'
import { validateUpgradeEligibility } from '../../../domain/subscription-upgrade/validate-upgrade-eligibility'

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
  const targetPlan = {
    id: 'plan_plus',
    slug: 'PLUS',
    name: 'Plus',
    order: 2,
    amountCents: 30000,
    productName: 'Plus anual',
    externalId: 'PLUS-ANUAL',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolvePaymentProvider).mockResolvedValue({
      id: 'prov_1',
      handlerKey: 'abacate',
      gatewayCode: 'ABACATE_PAY',
    } as never)
    vi.mocked(resolveCheckoutHandler).mockReturnValue(mockHandler)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(targetPlan as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_1',
      name: 'João',
      fullname: 'João Victor Costa',
      email: 'user@example.com',
      phone: '11999999999',
      document: '52998224725',
      Address: null,
    } as never)
    vi.mocked(prisma.payment.create).mockResolvedValue({ id: 'pay_1' } as never)
    vi.mocked(prisma.payment.update).mockResolvedValue({ id: 'pay_1' } as never)
    vi.mocked(resolveBillingState).mockResolvedValue({
      activeSubscription: null,
      currentPlan: null,
      currentOrder: 0,
    })
  })

  it('cobra preço cheio em compra nova', async () => {
    vi.mocked(validateUpgradeEligibility).mockReturnValue({
      ok: true,
      mode: 'purchase',
      targetPlan: {
        id: targetPlan.id,
        slug: targetPlan.slug,
        name: targetPlan.name,
        order: targetPlan.order,
        amountCents: targetPlan.amountCents,
      },
      amountDueCents: 30000,
      listPriceCents: 30000,
    })

    const useCase = new CreateCheckoutUseCase(repo)
    const result = await useCase.execute({
      userId: 'user_1',
      planSlug: 'plus',
      returnUrl: 'http://localhost:3000/cart/plus',
      completionUrl: 'http://localhost:3000/',
    })

    expect(result.ok).toBe(true)
    expect(prisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amountCents: 30000 }),
      }),
    )
    expect(mockHandler.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 30000 }),
    )
  })

  it('cobra valor proratado e grava metadata em upgrade', async () => {
    vi.mocked(validateUpgradeEligibility).mockReturnValue({
      ok: true,
      mode: 'upgrade',
      targetPlan: {
        id: targetPlan.id,
        slug: targetPlan.slug,
        name: targetPlan.name,
        order: targetPlan.order,
        amountCents: targetPlan.amountCents,
      },
      currentPlan: {
        id: 'plan_basic',
        slug: 'BASIC',
        name: 'Basic',
        order: 1,
        amountCents: 10000,
      },
      activeSubscription: {
        id: 'sub_1',
        planId: 'plan_basic',
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2027-01-01'),
        plan: {
          id: 'plan_basic',
          slug: 'BASIC',
          name: 'Basic',
          order: 1,
          amountCents: 10000,
        },
      },
      amountDueCents: 9500,
      listPriceCents: 30000,
      daysRemaining: 180,
      totalDays: 365,
      currentRemainingCents: 5000,
      targetRemainingCents: 14500,
      preservedEndsAt: new Date('2027-01-01'),
    })

    const useCase = new CreateCheckoutUseCase(repo)
    await useCase.execute({
      userId: 'user_1',
      planSlug: 'plus',
      returnUrl: 'http://localhost:3000/cart/plus',
      completionUrl: 'http://localhost:3000/',
    })

    expect(prisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amountCents: 9500,
          metadata: expect.objectContaining({
            kind: 'upgrade',
            fromSubscriptionId: 'sub_1',
            toPlanId: 'plan_plus',
          }),
        }),
      }),
    )
  })

  it('rejeita checkout quando elegibilidade falha', async () => {
    vi.mocked(validateUpgradeEligibility).mockReturnValue({
      ok: false,
      reason: 'downgrade_not_allowed',
    })

    const useCase = new CreateCheckoutUseCase(repo)
    const result = await useCase.execute({
      userId: 'user_1',
      planSlug: 'plus',
      returnUrl: 'http://localhost:3000/cart/plus',
      completionUrl: 'http://localhost:3000/',
    })

    expect(result).toEqual({ ok: false, reason: 'downgrade_not_allowed' })
    expect(prisma.payment.create).not.toHaveBeenCalled()
  })
})
