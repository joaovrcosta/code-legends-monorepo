import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetLessonByIdUseCase } from '../../../utils/factories/make-get-lesson-by-id-use-case'
import { LessonNotFoundError } from '../../../use-cases/errors/lesson-not-found'

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    lessonId: z.coerce.number().int().positive(),
  })

  const { lessonId } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetLessonByIdUseCase()
    const { lesson } = await useCase.execute({ lessonId })
    return reply.status(200).send({ lesson })
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    request.log.error(error, 'getLessonById error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
