import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetWeeklyXpUseCase } from '../../../utils/factories/make-get-weekly-xp-use-case'

export async function getWeeklyXp(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.id
    const useCase = makeGetWeeklyXpUseCase()
    const result = await useCase.execute(userId)
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar XP semanal:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

