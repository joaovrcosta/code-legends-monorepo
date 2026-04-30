import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSubmitCareerExamAttemptUseCase } from '../../../utils/factories/make-submit-career-exam-attempt-use-case'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function submitExamAttempt(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    careerIdentifier: z.string(),
    examId: z.string(),
  })

  const bodySchema = z.object({
    score: z.number(),
    answers: z.unknown().optional(),
  })

  const { careerIdentifier, examId } = paramsSchema.parse(request.params)
  const { score, answers } = bodySchema.parse(request.body || {})

  try {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        careerIdentifier,
      )
    const career = await import('../../../lib/prisma').then(({ prisma }) =>
      prisma.career.findUnique({
        where: isUUID ? { id: careerIdentifier } : { slug: careerIdentifier },
        select: { id: true, active: true },
      }),
    )
    if (!career || !career.active) {
      throw new CareerNotFoundError()
    }

    const useCase = makeSubmitCareerExamAttemptUseCase()
    const result = await useCase.execute({
      userId: request.user.id,
      careerId: career.id,
      examId,
      score,
      answers,
    })
    return reply.status(201).send(result)
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof Error && error.message === 'User is not enrolled in this career') {
      return reply.status(403).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

