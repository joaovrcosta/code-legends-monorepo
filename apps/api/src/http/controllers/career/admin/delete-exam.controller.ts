import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminDeleteCareerExam(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ careerId: z.string(), examId: z.string() })
  const { careerId, examId } = paramsSchema.parse(request.params)

  await prisma.careerExam.delete({
    where: { id: examId, careerId },
  })

  return reply.status(204).send()
}

