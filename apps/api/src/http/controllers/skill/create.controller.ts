import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function createSkill(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createSkillBodySchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
  })

  const { name, slug, description } = createSkillBodySchema.parse(
    request.body,
  )

  try {
    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description,
      },
    })

    return reply.status(201).send({ skill })
  } catch (error: any) {
    console.error('Erro ao criar skill:', error)

    if (error?.code === 'P2002') {
      return reply.status(400).send({
        message: 'Já existe uma skill com este slug',
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

