import { FastifyReply, FastifyRequest } from "fastify";
import { isImplicitFreeSlug } from "@code-legends/plans";
import { prisma } from "../../../lib/prisma";

export async function deletePlan(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;

    const existing = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            payments: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!existing) {
      return reply.status(404).send({ message: "Plano não encontrado" });
    }

    if (isImplicitFreeSlug(existing.slug)) {
      return reply.status(400).send({
        message: "O plano gratuito (FREE) não pode ser excluído",
      });
    }

    const { users, payments, subscriptions } = existing._count;
    if (users > 0 || payments > 0 || subscriptions > 0) {
      return reply.status(400).send({
        message:
          "Não é possível excluir um plano com usuários, pagamentos ou assinaturas vinculados. Desative-o em vez de excluir.",
      });
    }

    await prisma.plan.delete({ where: { id } });

    return reply.status(204).send();
  } catch (error) {
    request.log.error(error, "Failed to delete plan");
    return reply.status(500).send({ message: "Erro interno ao excluir plano" });
  }
}
