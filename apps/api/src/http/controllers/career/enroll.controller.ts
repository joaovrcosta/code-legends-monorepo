import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeEnrollCareerUseCase } from '../../../utils/factories/make-enroll-career-use-case'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function enroll(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeEnrollCareerUseCase()
    const { userCareer } = await useCase.execute({
      userId: request.user.id,
      careerId: id,
    })
    return reply.status(201).send({ userCareer })
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

