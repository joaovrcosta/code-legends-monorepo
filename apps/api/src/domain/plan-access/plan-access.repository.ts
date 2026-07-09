import { prisma } from '../../lib/prisma'
import type { ResolvedPlan } from './plan-access.port'

type PlanRow = {
  id: string
  slug: string
  name: string
  features: unknown
  amountCents: number
  imageUrl: string | null
  colorHex: string | null
}

function parseFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string')
}

function toResolvedPlan(plan: PlanRow): ResolvedPlan {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    features: parseFeatures(plan.features) as ResolvedPlan['features'],
    amountCents: plan.amountCents,
    imageUrl: plan.imageUrl,
    colorHex: plan.colorHex,
  }
}

const planSelect = {
  id: true,
  slug: true,
  name: true,
  features: true,
  amountCents: true,
  imageUrl: true,
  colorHex: true,
} as const

export class PlanAccessRepository {
  async findPlanById(planId: string): Promise<ResolvedPlan | null> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: planSelect,
    })
    return plan ? toResolvedPlan(plan) : null
  }

  async findUserPlanId(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planId: true },
    })
    return user?.planId ?? null
  }

  async findActiveSubscriptionPlanId(userId: string): Promise<{
    planId: string
    endsAt: Date
  } | null> {
    const now = new Date()
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'desc' },
      select: { planId: true, endsAt: true },
    })
    return subscription ?? null
  }

  async findExpiredActiveSubscriptions(now: Date) {
    return prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { lte: now },
      },
      select: {
        id: true,
        userId: true,
        planId: true,
      },
    })
  }

  async expireSubscriptionAndRevertUser(
    subscriptionId: string,
    userId: string,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'EXPIRED' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { planId: null },
      }),
    ])
  }
}
