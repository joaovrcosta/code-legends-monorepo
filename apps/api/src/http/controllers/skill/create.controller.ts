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
    imageUrl: z
      .union([z.string().max(2048), z.literal(''), z.null()])
      .optional(),
  })

  const body = createSkillBodySchema.parse(request.body)
  const { name, slug, description, imageUrl: imageUrlRaw } = body
  const imageUrl =
    imageUrlRaw !== undefined &&
    imageUrlRaw !== null &&
    String(imageUrlRaw).length > 0
      ? String(imageUrlRaw)
      : null

  try {
    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
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

