import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminUpdateCareerModule(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ careerId: z.string(), moduleId: z.string() })
  const bodySchema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    orderIndex: z.number().int().optional(),
  })

  const { careerId, moduleId } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body || {})

  const module = await prisma.careerModule.update({
    where: { id: moduleId, careerId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.orderIndex !== undefined ? { orderIndex: body.orderIndex } : {}),
    },
  })

  return reply.status(200).send({ module })
}

