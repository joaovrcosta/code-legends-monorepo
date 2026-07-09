import { prisma } from '../../../lib/prisma'
import { isUpgradePaymentMetadata } from '../../../domain/subscription-upgrade'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export interface HandlePaymentPaidInput {
  gatewayPaymentId: string
  gateway: string
}

export type HandlePaymentPaidResult =
  | { ok: true; reason: 'processed' | 'already_paid' }
  | { ok: false; reason: 'payment_not_found' }

/**
 * Processa pagamento confirmado no gateway: atualiza Payment para PAID,
 * User.planId e cria Subscription. Upgrades preservam endsAt e cancelam subs anteriores.
 */
export class HandlePaymentPaidUseCase {
  async execute({
    gatewayPaymentId,
    gateway,
  }: HandlePaymentPaidInput): Promise<HandlePaymentPaidResult> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId, gateway },
      select: {
        id: true,
        userId: true,
        planId: true,
        status: true,
        metadata: true,
      },
    })

    if (!payment) {
      return { ok: false, reason: 'payment_not_found' }
    }

    if (payment.status === 'PAID') {
      return { ok: true, reason: 'already_paid' }
    }

    const now = new Date()
    const upgradeMetadata = isUpgradePaymentMetadata(payment.metadata)
      ? payment.metadata
      : null

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: now },
      })

      await tx.user.update({
        where: { id: payment.userId },
        data: { planId: payment.planId },
      })

      const targetPlan = await tx.plan.findUnique({
        where: { id: payment.planId },
        select: { order: true },
      })

      if (upgradeMetadata && targetPlan) {
        await tx.subscription.update({
          where: { id: upgradeMetadata.fromSubscriptionId },
          data: { status: 'CANCELLED' },
        })

        await tx.subscription.updateMany({
          where: {
            userId: payment.userId,
            status: 'ACTIVE',
            id: { not: upgradeMetadata.fromSubscriptionId },
            planRecord: { order: { lt: targetPlan.order } },
          },
          data: { status: 'CANCELLED' },
        })

        await tx.subscription.create({
          data: {
            userId: payment.userId,
            planId: payment.planId,
            status: 'ACTIVE',
            startsAt: now,
            endsAt: new Date(upgradeMetadata.preservedEndsAt),
            gatewaySubscriptionId: gatewayPaymentId,
          },
        })
        return
      }

      const endsAt = new Date(now.getTime() + ONE_YEAR_MS)
      await tx.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId,
          status: 'ACTIVE',
          startsAt: now,
          endsAt,
          gatewaySubscriptionId: gatewayPaymentId,
        },
      })
    })

    return { ok: true, reason: 'processed' }
  }
}
