import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PlanFeatures } from '@code-legends/plans'
import { PlanAccessService } from './plan-access.service'
import { PlanAccessRepository } from './plan-access.repository'
import type { ResolvedPlan } from './plan-access.port'

function makePlan(
  slug: string,
  features: ResolvedPlan['features'],
): ResolvedPlan {
  return {
    id: `plan-${slug}`,
    slug,
    name: slug,
    features,
    amountCents: slug === 'FREE' ? 0 : 19700,
    imageUrl: null,
    colorHex: null,
  }
}

describe('PlanAccessService', () => {
  const repository = {
    findFreePlan: vi.fn(),
    findPlanById: vi.fn(),
    findUserPlanId: vi.fn(),
    findActiveSubscriptionPlanId: vi.fn(),
  } as unknown as PlanAccessRepository

  let service: PlanAccessService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PlanAccessService(repository)
    vi.mocked(repository.findFreePlan).mockResolvedValue(
      makePlan('FREE', []),
    )
  })

  it('FREE não tem catalog.paid', async () => {
    vi.mocked(repository.findActiveSubscriptionPlanId).mockResolvedValue(null)
    vi.mocked(repository.findUserPlanId).mockResolvedValue('plan-FREE')
    vi.mocked(repository.findPlanById).mockResolvedValue(makePlan('FREE', []))

    await expect(
      service.hasFeature('user-1', PlanFeatures.CATALOG_PAID),
    ).resolves.toBe(false)
  })

  it('PRO tem catalog.paid', async () => {
    vi.mocked(repository.findActiveSubscriptionPlanId).mockResolvedValue(null)
    vi.mocked(repository.findUserPlanId).mockResolvedValue('plan-PRO')
    vi.mocked(repository.findPlanById).mockResolvedValue(
      makePlan('PRO', [PlanFeatures.CATALOG_PAID]),
    )

    await expect(
      service.hasFeature('user-1', PlanFeatures.CATALOG_PAID),
    ).resolves.toBe(true)
  })

  it('PREMIUM tem career.enroll e path_unit.access', async () => {
    const premiumFeatures = [
      PlanFeatures.CATALOG_PAID,
      PlanFeatures.CAREER_ENROLL,
      PlanFeatures.PATH_UNIT_ACCESS,
    ]
    vi.mocked(repository.findActiveSubscriptionPlanId).mockResolvedValue({
      planId: 'plan-PREMIUM',
      endsAt: new Date(Date.now() + 86400000),
    })
    vi.mocked(repository.findPlanById).mockResolvedValue(
      makePlan('PREMIUM', premiumFeatures),
    )

    await expect(
      service.hasFeature('user-1', PlanFeatures.CAREER_ENROLL),
    ).resolves.toBe(true)
    await expect(
      service.hasFeature('user-1', PlanFeatures.PATH_UNIT_ACCESS),
    ).resolves.toBe(true)
  })

  it('subscription expirada nega acesso antes do job rodar', async () => {
    vi.mocked(repository.findActiveSubscriptionPlanId).mockResolvedValue(null)
    vi.mocked(repository.findUserPlanId).mockResolvedValue('plan-FREE')
    vi.mocked(repository.findPlanById).mockResolvedValue(makePlan('FREE', []))

    await expect(
      service.hasFeature('user-1', PlanFeatures.CATALOG_PAID),
    ).resolves.toBe(false)
  })
})
