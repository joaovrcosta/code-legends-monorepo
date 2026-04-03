import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export async function resetUserSkills(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    userId: z.string(),
  });

  const { userId } = paramsSchema.parse(request.params);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  await prisma.$transaction([
    prisma.userSkillXpHistory.deleteMany({ where: { userId } }),
    prisma.userSkillXp.deleteMany({ where: { userId } }),
  ]);

  return reply.status(200).send({
    message: "Skill XP and history cleared for user",
    userId,
  });
}
