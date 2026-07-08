import { prisma } from '../../../lib/prisma'

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
 * User.planId e cria Subscription (1 ano). Idempotente.
 */
export class HandlePaymentPaidUseCase {
  async execute({
    gatewayPaymentId,
    gateway,
  }: HandlePaymentPaidInput): Promise<HandlePaymentPaidResult> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId, gateway },
      select: { id: true, userId: true, planId: true, status: true },
    })

    if (!payment) {
      return { ok: false, reason: 'payment_not_found' }
    }

    if (payment.status === 'PAID') {
      return { ok: true, reason: 'already_paid' }
    }

    const now = new Date()
    const endsAt = new Date(now.getTime() + ONE_YEAR_MS)

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: now },
      })

      await tx.user.update({
        where: { id: payment.userId },
        data: { planId: payment.planId },
      })

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
