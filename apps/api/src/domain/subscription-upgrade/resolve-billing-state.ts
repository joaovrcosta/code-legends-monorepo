import { prisma } from '../../lib/prisma'
import type { BillingState, PlanBillingInfo } from './types'

const planSelect = {
  id: true,
  slug: true,
  name: true,
  order: true,
  amountCents: true,
} as const

function toPlanBillingInfo(plan: {
  id: string
  slug: string
  name: string
  order: number
  amountCents: number
}): PlanBillingInfo {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    order: plan.order,
    amountCents: plan.amountCents,
  }
}

export async function resolveBillingState(userId: string): Promise<BillingState> {
  const now = new Date()
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      endsAt: { gt: now },
      planRecord: { amountCents: { gt: 0 } },
    },
    orderBy: [{ planRecord: { order: 'desc' } }, { endsAt: 'desc' }],
    select: {
      id: true,
      planId: true,
      startsAt: true,
      endsAt: true,
      planRecord: { select: planSelect },
    },
  })

  const top = subscriptions[0]
  if (!top) {
    return {
      activeSubscription: null,
      currentPlan: null,
      currentOrder: 0,
    }
  }

  const currentPlan = toPlanBillingInfo(top.planRecord)

  return {
    activeSubscription: {
      id: top.id,
      planId: top.planId,
      startsAt: top.startsAt,
      endsAt: top.endsAt,
      plan: currentPlan,
    },
    currentPlan,
    currentOrder: currentPlan.order,
  }
}
