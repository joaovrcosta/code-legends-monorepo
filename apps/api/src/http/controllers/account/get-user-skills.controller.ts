import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { sanitizeUser } from "../../utils/sanitize";
import { Role } from "@prisma/client";
import { canViewUserSkills } from "../../utils/skill-visibility";
import { getRollingWeekBounds } from "../../../utils/rolling-week-bounds";

export async function getUserSkills(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    userId: z.string(),
  });

  const { userId } = paramsSchema.parse(request.params);

  if (
    !canViewUserSkills({
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role,
      targetUserId: userId,
    })
  ) {
    return reply.status(403).send({
      message: "Forbidden Access: You are not authorized to access this resource",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Address: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const skills = await prisma.userSkillXp.findMany({
      where: { userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        xp: "desc",
      },
    });

    const { from, toExclusive } = getRollingWeekBounds();
    const weeklyGains = await prisma.userSkillXpHistory.groupBy({
      by: ["skillId"],
      where: {
        userId,
        createdAt: { gte: from, lt: toExclusive },
      },
      _sum: { xpAmount: true },
    });
    const gainedBySkill = new Map(
      weeklyGains.map((row) => [row.skillId, row._sum.xpAmount ?? 0]),
    );

    const sanitizedUser = sanitizeUser(user, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: request.user.role === Role.ADMIN,
    });

    return reply.status(200).send({
      user: sanitizedUser,
      skills: skills.map((item) => {
        const xpGainedThisWeek = gainedBySkill.get(item.skillId) ?? 0;
        return {
          skillId: item.skillId,
          name: item.skill.name,
          slug: item.skill.slug,
          imageUrl: item.skill.imageUrl,
          xp: item.xp,
          previousXp: Math.max(0, item.xp - xpGainedThisWeek),
          xpGainedThisWeek,
        };
      }),
    });
  } catch (error) {
    console.error("Erro ao buscar skills do usuário:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
