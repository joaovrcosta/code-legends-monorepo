import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";

export async function getPlanById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const plan = await prisma.plan.findUnique({
      where: { id },
    });
    if (!plan) {
      return reply.status(404).send({ message: "Plan not found" });
    }
    return reply.status(200).send(plan);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
