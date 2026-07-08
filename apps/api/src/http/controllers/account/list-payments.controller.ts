import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";

export async function listPayments(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        planRecord: { select: { slug: true } },
      },
    });

    const data = payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      userEmail: p.user.email,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status,
      plan: p.planRecord.slug,
      planId: p.planId,
      gateway: p.gateway,
      gatewayPaymentId: p.gatewayPaymentId,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

    return reply.status(200).send({ payments: data });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
