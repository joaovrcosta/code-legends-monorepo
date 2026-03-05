import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function updateSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const bodySchema = z.object({
    skills: z
      .array(
        z.object({
          skillId: z.string().cuid(),
          weight: z.number().int().min(0).max(100),
        }),
      )
      .default([]),
  })

  const { id: courseId } = paramsSchema.parse(request.params)
  const { skills } = bodySchema.parse(request.body)

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.courseSkill.deleteMany({
        where: { courseId },
      })

      if (skills.length > 0) {
        await tx.courseSkill.createMany({
          data: skills.map((item) => ({
            courseId,
            skillId: item.skillId,
            weight: item.weight,
          })),
        })
      }
    })

    const updated = await prisma.courseSkill.findMany({
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
      skills: updated.map((cs) => ({
        skillId: cs.skillId,
        name: cs.skill.name,
        slug: cs.skill.slug,
        description: cs.skill.description,
        weight: cs.weight,
      })),
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

