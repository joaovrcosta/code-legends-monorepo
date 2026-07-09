import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ExpireSubscriptionsUseCase } from './expire-subscriptions'
import { PlanAccessRepository } from '../../domain/plan-access/plan-access.repository'

describe('ExpireSubscriptionsUseCase', () => {
  const repository = {
    findExpiredActiveSubscriptions: vi.fn(),
    expireSubscriptionAndRevertUser: vi.fn(),
  } as unknown as PlanAccessRepository

  let useCase: ExpireSubscriptionsUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new ExpireSubscriptionsUseCase(repository)
  })

  it('expira subscriptions e reverte user para planId null sem buscar FREE', async () => {
    const now = new Date('2026-07-09T12:00:00Z')
    vi.mocked(repository.findExpiredActiveSubscriptions).mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', planId: 'plan-pro' },
      { id: 'sub-2', userId: 'user-2', planId: 'plan-premium' },
    ])
    vi.mocked(repository.expireSubscriptionAndRevertUser).mockResolvedValue()

    const result = await useCase.execute(now)

    expect(result).toEqual({ expiredCount: 2 })
    expect(repository.findExpiredActiveSubscriptions).toHaveBeenCalledWith(now)
    expect(repository.expireSubscriptionAndRevertUser).toHaveBeenCalledTimes(2)
    expect(repository.expireSubscriptionAndRevertUser).toHaveBeenNthCalledWith(
      1,
      'sub-1',
      'user-1',
    )
    expect(repository.expireSubscriptionAndRevertUser).toHaveBeenNthCalledWith(
      2,
      'sub-2',
      'user-2',
    )
  })

  it('retorna expiredCount 0 quando não há subscriptions expiradas', async () => {
    vi.mocked(repository.findExpiredActiveSubscriptions).mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual({ expiredCount: 0 })
    expect(repository.expireSubscriptionAndRevertUser).not.toHaveBeenCalled()
  })
})
