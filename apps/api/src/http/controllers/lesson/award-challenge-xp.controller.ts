import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { LessonNotFoundError } from '../../../use-cases/errors/lesson-not-found'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'
import { makeAwardChallengeXpUseCase } from '../../../utils/factories/make-award-challenge-xp-use-case'

const paramsSchema = z.object({
  id: z.string().transform(Number),
})

const bodySchema = z.object({
  challengeIndex: z.coerce.number().int().min(0),
})

export async function awardChallengeXp(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsParsed = paramsSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return reply.status(400).send({
      message: 'Parâmetros inválidos',
      code: 'INVALID_PARAMS',
    })
  }
  const { id: lessonId } = paramsParsed.data

  const bodyParsed = bodySchema.safeParse(request.body ?? {})
  if (!bodyParsed.success) {
    return reply.status(400).send({
      message: 'Corpo inválido: envie { challengeIndex: number }.',
      code: 'INVALID_BODY',
    })
  }
  const { challengeIndex } = bodyParsed.data

  try {
    const useCase = makeAwardChallengeXpUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId,
      challengeIndex,
    })
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({
        message: error.message,
        code: 'LESSON_NOT_FOUND',
      })
    }
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({
        message: error.message,
        code: 'COURSE_NOT_FOUND',
      })
    }
    if (
      error instanceof Error &&
      error.message === 'INVALID_CHALLENGE_INDEX'
    ) {
      return reply.status(400).send({
        message: 'Índice de desafio inválido para esta lição.',
        code: 'INVALID_CHALLENGE_INDEX',
      })
    }
    console.error('Error awarding challenge XP:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
