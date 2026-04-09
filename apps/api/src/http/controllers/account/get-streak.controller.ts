import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetStreakUseCase } from '../../../utils/factories/make-get-streak-use-case'

export async function getStreak(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.id
    const useCase = makeGetStreakUseCase()
    const result = await useCase.execute(userId)
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar streak:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

