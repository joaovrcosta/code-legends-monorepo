import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function listSkills(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listSkillsQuerySchema = z.object({
    search: z.string().optional(),
  })

  const { search } = listSkillsQuerySchema.parse(request.query)

  try {
    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const skills = await prisma.skill.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: search ? 50 : 200,
    })

    return reply.status(200).send({
      skills: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        coursesCount: skill._count.courses,
      })),
    })
  } catch (error) {
    console.error('Erro ao listar skills:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

