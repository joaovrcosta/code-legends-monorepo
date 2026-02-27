import { FastifyReply, FastifyRequest } from "fastify";
import { listBillings } from "../../../lib/abacatepay";
import { prisma } from "../../../lib/prisma";
import { env } from "../../../env";
import { makeHandleAbacateBillingPaidUseCase } from "../../../utils/factories/make-handle-abacate-billing-paid-use-case";

/**
 * Sincroniza status dos pagamentos Abacate Pay com GET /billing/list.
 * Só atualiza o banco; não retorna a lista (use GET /payments para listar).
 */
export async function syncPayments(request: FastifyRequest, reply: FastifyReply) {
  try {
    const apiKey = env.ABACATE_PAY_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({
        message: "Abacate Pay not configured (ABACATE_PAY_API_KEY)",
      });
    }

    const billings = await listBillings(apiKey);
    const billingById = new Map(billings.map((b) => [b.id, b]));

    const payments = await prisma.payment.findMany({
      where: { gateway: "ABACATE_PAY", gatewayPaymentId: { not: null } },
      select: {
        id: true,
        status: true,
        gatewayPaymentId: true,
      },
    });

    const handlePaid = makeHandleAbacateBillingPaidUseCase();
    let updated = 0;

    for (const p of payments) {
      const billingId = p.gatewayPaymentId!;
      const billing = billingById.get(billingId);
      if (!billing) continue;

      if (billing.status === "PAID" && p.status !== "PAID") {
        await handlePaid.execute({ billingId });
        updated++;
        continue;
      }
      if (
        (billing.status === "EXPIRED" || billing.status === "CANCELLED") &&
        p.status === "PENDING"
      ) {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "FAILED" },
        });
        updated++;
        continue;
      }
      if (billing.status === "REFUNDED" && p.status === "PAID") {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "REFUNDED" },
        });
        updated++;
      }
    }

    return reply.status(200).send({
      ok: true,
      message: "Sincronização concluída",
      updated,
    });
  } catch (error) {
    request.log.error(error, "syncPayments error");
    return reply.status(500).send({ message: "Internal server error" });
  }
}
