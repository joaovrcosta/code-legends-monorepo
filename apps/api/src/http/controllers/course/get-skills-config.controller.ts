import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id: courseId } = paramsSchema.parse(request.params)

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
            description: true,
          },
        },
      },
      orderBy: {
        weight: 'desc',
      },
    })

    return reply.status(200).send({
      courseId,
      skills: courseSkills.map((cs) => ({
        skillId: cs.skillId,
        name: cs.skill.name,
        slug: cs.skill.slug,
        description: cs.skill.description,
        weight: cs.weight,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar configuração de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

