import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getUserStreak(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    userId: z.string(),
  })

  const { userId } = paramsSchema.parse(request.params)

  try {
    const row = await prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        bestStreak: true,
        totalActiveDays: true,
        lastActiveDate: true,
      },
    })

    return reply.status(200).send({
      current: row?.currentStreak ?? 0,
      best: row?.bestStreak ?? 0,
      totalActiveDays: row?.totalActiveDays ?? 0,
      lastActiveDate: row?.lastActiveDate ?? null,
    })
  } catch (error) {
    console.error('Erro ao buscar streak do usuário:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

