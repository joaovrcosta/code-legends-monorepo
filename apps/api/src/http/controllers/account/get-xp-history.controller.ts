import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetXpHistoryUseCase } from '../../../utils/factories/make-get-xp-history-use-case'

const querySchema = z.object({
  days: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export async function getXpHistory(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.id
    const { days, limit } = querySchema.parse(request.query ?? {})
    const useCase = makeGetXpHistoryUseCase()
    const result = await useCase.execute(userId, { days, limit })
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar histórico de XP:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

