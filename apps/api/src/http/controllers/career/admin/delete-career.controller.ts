import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminDeleteCareer(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string() })
  const { id } = paramsSchema.parse(request.params)

  // soft delete: mantém histórico
  await prisma.career.update({
    where: { id },
    data: { active: false },
  })

  return reply.status(204).send()
}

