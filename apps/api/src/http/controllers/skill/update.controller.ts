import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function updateSkill(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().cuid(),
  })

  const updateSkillBodySchema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const data = updateSkillBodySchema.parse(request.body)

  try {
    const skill = await prisma.skill.update({
      where: { id },
      data,
    })

    return reply.status(200).send({ skill })
  } catch (error: any) {
    console.error('Erro ao atualizar skill:', error)

    if (error?.code === 'P2002') {
      return reply.status(400).send({
        message: 'Já existe uma skill com este slug',
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

