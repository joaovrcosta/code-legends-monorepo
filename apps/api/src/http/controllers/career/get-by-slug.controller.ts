import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetCareerBySlugUseCase } from '../../../utils/factories/make-get-career-by-slug-use-case'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function getBySlug(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    slug: z.string(),
  })
  const { slug } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetCareerBySlugUseCase()
    const result = await useCase.execute({ slug, userId: request.user.id })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

