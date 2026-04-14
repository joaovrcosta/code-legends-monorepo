import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { resolveUserStreakForApi } from '../../../lib/user-streak-resolve'

export async function getUserStreak(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    userId: z.string(),
  })

  const { userId } = paramsSchema.parse(request.params)

  try {
    const result = await resolveUserStreakForApi(userId)
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar streak do usuário:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

