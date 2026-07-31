import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { LessonNotFoundError } from '../../../use-cases/errors/lesson-not-found'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'
import { LabStudentFilesValidationError } from '../../../lib/lab-student-files'
import { LabRateLimitedError } from '../../../lib/lab-throttle'
import {
  makeCreateLabCodeAttemptUseCase,
  makeListLabCodeAttemptsUseCase,
} from '../../../utils/factories/make-lab-code-attempts-use-case'

export async function listLabCodeAttempts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().transform(Number),
  })
  const querySchema = z.object({
    stepId: z.string().min(1).optional(),
    take: z.coerce.number().int().positive().max(50).optional(),
    cursor: z.string().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const query = querySchema.parse(request.query)

  try {
    const useCase = makeListLabCodeAttemptsUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId: id,
      stepId: query.stepId,
      take: query.take,
      cursor: query.cursor,
    })
    return reply.status(200).send(result)
  } catch (error) {
    throw error
  }
}

export async function createLabCodeAttempt(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().transform(Number),
  })
  const bodySchema = z.object({
    stepId: z.string().min(1).max(128),
    result: z.enum(['pass', 'fail', 'timeout', 'error']),
    files: z.record(z.string()),
  })

  const { id } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body)

  try {
    const useCase = makeCreateLabCodeAttemptUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId: id,
      stepId: body.stepId,
      files: body.files,
      result: body.result,
    })
    return reply.status(201).send({
      attempt: {
        id: result.attempt.id,
        stepId: result.attempt.stepId,
        result: result.attempt.result,
        createdAt: result.attempt.createdAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof LabRateLimitedError) {
      return reply.status(429).send({
        success: false,
        error: error.message,
        code: 'RATE_LIMITED',
      })
    }
    if (error instanceof LabStudentFilesValidationError) {
      return reply.status(400).send({
        success: false,
        error: error.message,
        code: 'INVALID_LAB_FILES',
      })
    }
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
    if (error instanceof Error && error.message.includes('inválido')) {
      return reply.status(400).send({
        success: false,
        error: error.message,
        code: 'INVALID_INPUT',
      })
    }
    throw error
  }
}
