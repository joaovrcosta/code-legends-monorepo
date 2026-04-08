import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import {
  calculateLevel,
  calculateXpRemainingToNextLevel,
} from "../../../utils/xp-progression";

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

  await prisma.$transaction(async (tx) => {
    await tx.userSkillXpHistory.deleteMany({ where: { userId } });
    await tx.userSkillXp.deleteMany({ where: { userId } });

    // Histórico global de XP (timeline / semanal).
    await tx.userXpHistory.deleteMany({ where: { userId } });

    // Eventos idempotentes (ex.: lesson_completed:<id>) — sem isso o aluno não poderia ganhar XP de novo nas mesmas lições.
    await tx.userXpEvent.deleteMany({ where: { userId } });

    // Recalcula cache global a partir da fonte da verdade (skills).
    const totalXp = 0;
    const level = calculateLevel(totalXp);
    const xpToNextLevel = calculateXpRemainingToNextLevel(level, totalXp);

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp,
        level,
        xpToNextLevel,
      },
    });
  });

  return reply.status(200).send({
    message:
      "XP por skill, históricos, UserXpHistory e UserXpEvent limpos; nível e cache global zerados.",
    userId,
  });
}
