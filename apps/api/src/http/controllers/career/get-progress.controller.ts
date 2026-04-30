import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetCareerProgressUseCase } from '../../../utils/factories/make-get-career-progress-use-case'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function getProgress(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetCareerProgressUseCase()
    const result = await useCase.execute({ userId: request.user.id, careerId: id })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

