import { prisma } from "../../../lib/prisma";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface HandleAbacateBillingPaidInput {
  billingId: string;
}

export type HandleAbacateBillingPaidResult =
  | { ok: true; reason: "processed" | "already_paid" }
  | { ok: false; reason: "payment_not_found" };

/**
 * Processa evento billing.paid do Abacate Pay: atualiza Payment para PAID,
 * User.plan e cria Subscription (1 ano). Idempotente.
 */
export class HandleAbacateBillingPaidUseCase {
  async execute({
    billingId,
  }: HandleAbacateBillingPaidInput): Promise<HandleAbacateBillingPaidResult> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: billingId, gateway: "ABACATE_PAY" },
      select: { id: true, userId: true, plan: true, status: true },
    });

    if (!payment) {
      return { ok: false, reason: "payment_not_found" };
    }

    if (payment.status === "PAID") {
      return { ok: true, reason: "already_paid" };
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + ONE_YEAR_MS);

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: now },
      });

      await tx.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan },
      });

      await tx.subscription.create({
        data: {
          userId: payment.userId,
          plan: payment.plan,
          status: "ACTIVE",
          startsAt: now,
          endsAt,
          gatewaySubscriptionId: billingId,
        },
      });
    });

    return { ok: true, reason: "processed" };
  }
}
