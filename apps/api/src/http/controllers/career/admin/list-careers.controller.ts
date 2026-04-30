import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../../../lib/prisma'

export async function adminListCareers(_: FastifyRequest, reply: FastifyReply) {
  const careers = await prisma.career.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      modules: { orderBy: { orderIndex: 'asc' } },
      exams: { orderBy: { createdAt: 'asc' } },
    },
  })

  return reply.status(200).send({ careers })
}

