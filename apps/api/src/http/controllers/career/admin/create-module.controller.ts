import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminCreateCareerModule(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ careerId: z.string() })
  const bodySchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    orderIndex: z.number().int().optional(),
  })

  const { careerId } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body || {})

  const module = await prisma.careerModule.create({
    data: {
      careerId,
      title: body.title,
      description: body.description ?? null,
      orderIndex: body.orderIndex ?? 0,
    },
  })

  return reply.status(201).send({ module })
}

