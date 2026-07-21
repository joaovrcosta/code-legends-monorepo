import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { LessonNotFoundError } from '../../../use-cases/errors/lesson-not-found'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'
import { makeGetLabProgressUseCase } from '../../../utils/factories/make-lab-progress-use-case'
import { makeUpsertLabProgressUseCase } from '../../../utils/factories/make-lab-progress-use-case'

export async function getLabProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().transform(Number),
  })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetLabProgressUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId: id,
    })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({
        success: false,
        error: error.message,
        code: 'LESSON_NOT_FOUND',
      })
    }
    throw error
  }
}

export async function upsertLabProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().transform(Number),
  })
  const bodySchema = z.object({
    completedStepIds: z.array(z.string()),
    currentStepId: z.string().min(1),
    completedCount: z.number().int().nonnegative().optional(),
    currentStepIndex: z.number().int().nonnegative().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const labProgress = bodySchema.parse(request.body)

  try {
    const useCase = makeUpsertLabProgressUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId: id,
      labProgress,
    })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({
        success: false,
        error: error.message,
        code: 'LESSON_NOT_FOUND',
      })
    }
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({
        success: false,
        error: error.message,
        code: 'COURSE_NOT_FOUND',
      })
    }
    throw error
  }
}
