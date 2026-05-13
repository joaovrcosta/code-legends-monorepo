import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../../../lib/prisma'

export async function adminListCareers(_: FastifyRequest, reply: FastifyReply) {
  const careers = await prisma.career.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          courses: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              courseId: true,
              orderIndex: true,
              course: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      },
      exams: { orderBy: { createdAt: 'asc' } },
    },
  })

  return reply.status(200).send({ careers })
}

