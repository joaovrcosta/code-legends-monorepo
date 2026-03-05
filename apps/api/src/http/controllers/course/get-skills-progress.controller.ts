import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getSkillsProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id: courseId } = paramsSchema.parse(request.params)
  const userId = request.user.id

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    const courseSkills = await prisma.courseSkill.findMany({
      where: { courseId },
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
        weight: 'desc',
      },
    })

    if (courseSkills.length === 0) {
      return reply.status(200).send({
        courseId,
        skills: [],
      })
    }

    const skillIds = courseSkills.map((cs) => cs.skillId)

    const userSkills = await prisma.userSkillXp.findMany({
      where: {
        userId,
        skillId: {
          in: skillIds,
        },
      },
    })

    const xpBySkill = new Map<string, number>()
    for (const us of userSkills) {
      xpBySkill.set(us.skillId, us.xp)
    }

    return reply.status(200).send({
      courseId,
      skills: courseSkills.map((cs) => ({
        skillId: cs.skillId,
        name: cs.skill.name,
        slug: cs.skill.slug,
        weight: cs.weight,
        totalXp: xpBySkill.get(cs.skillId) ?? 0,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar progresso de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

