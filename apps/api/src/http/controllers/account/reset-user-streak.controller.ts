import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function resetUserStreak(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    userId: z.string(),
  })

  const { userId } = paramsSchema.parse(request.params)

  try {
    await prisma.userStreak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: 0,
        bestStreak: 0,
        totalActiveDays: 0,
        lastActiveDate: null,
      },
      update: {
        currentStreak: 0,
        bestStreak: 0,
        totalActiveDays: 0,
        lastActiveDate: null,
      },
      select: { userId: true },
    })

    return reply.status(204).send()
  } catch (error) {
    console.error('Erro ao zerar streak do usuário:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

