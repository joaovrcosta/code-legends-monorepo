import { FastifyReply, FastifyRequest } from 'fastify'
import { makePruneLabCodeAttemptsUseCase } from '../../../utils/factories/make-lab-code-attempts-use-case'

export async function pruneLabCodeAttempts(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makePruneLabCodeAttemptsUseCase()
  const result = await useCase.execute()
  return reply.status(200).send({
    success: true,
    deletedCount: result.deletedCount,
  })
}
