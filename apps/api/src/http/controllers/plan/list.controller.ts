import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";

export async function listPlans(request: FastifyRequest, reply: FastifyReply) {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { order: "asc" },
    });
    return reply.status(200).send({ plans });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

/** Lista planos ativos para o frontend (rota pública). */
export async function listPublicPlans(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return reply.status(200).send({ plans });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
