import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListCareerExamAttemptsUseCase } from '../../../utils/factories/make-list-career-exam-attempts-use-case'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function listExamAttempts(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    careerIdentifier: z.string(),
  })
  const querySchema = z.object({
    examId: z.string().optional(),
  })
  const { careerIdentifier } = paramsSchema.parse(request.params)
  const { examId } = querySchema.parse(request.query ?? {})

  try {
    const useCase = makeListCareerExamAttemptsUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      careerIdentifier,
      examId,
    })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
