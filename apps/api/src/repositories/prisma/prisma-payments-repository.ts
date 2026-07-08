import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IPaymentsRepository, PaidPaymentRow } from "../payments-repository";

export class PrismaPaymentsRepository implements IPaymentsRepository {
  async findLatestPaidByUserId(userId: string): Promise<PaidPaymentRow | null> {
    const row = await prisma.payment.findFirst({
      where: { userId, status: PaymentStatus.PAID },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      include: {
        planRecord: { select: { slug: true, amountCents: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      status: row.status,
      planSlug: row.planRecord.slug,
      planAmountCents: row.planRecord.amountCents,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      metadata: row.metadata,
    };
  }

  async findPaidByIdAndUserId(
    paymentId: string,
    userId: string
  ): Promise<{ id: string; status: string } | null> {
    const row = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      select: { id: true, status: true },
    });
    if (!row) return null;
    return { id: row.id, status: row.status };
  }
}
