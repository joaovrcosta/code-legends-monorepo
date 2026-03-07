import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { sanitizeUser } from "../../utils/sanitize";
import { Role } from "@prisma/client";
import { canViewUserSkills } from "../../utils/skill-visibility";

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
          },
        },
      },
      orderBy: {
        xp: "desc",
      },
    });

    const sanitizedUser = sanitizeUser(user, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: request.user.role === Role.ADMIN,
    });

    return reply.status(200).send({
      user: sanitizedUser,
      skills: skills.map((item) => ({
        skillId: item.skillId,
        name: item.skill.name,
        slug: item.skill.slug,
        xp: item.xp,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar skills do usuário:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
