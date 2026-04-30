import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminDeleteCareerModule(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ careerId: z.string(), moduleId: z.string() })
  const { careerId, moduleId } = paramsSchema.parse(request.params)

  await prisma.careerModule.delete({
    where: { id: moduleId, careerId },
  })

  return reply.status(204).send()
}

