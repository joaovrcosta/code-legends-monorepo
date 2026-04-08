import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetXpHistoryUseCase } from '../../../utils/factories/make-get-xp-history-use-case'

const paramsSchema = z.object({
  userId: z.string().min(1),
})

const querySchema = z.object({
  days: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export async function getUserXpHistory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = paramsSchema.parse(request.params ?? {})
    const { days, limit } = querySchema.parse(request.query ?? {})

    const useCase = makeGetXpHistoryUseCase()
    const result = await useCase.execute(userId, { days, limit })
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar histórico de XP do usuário:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

