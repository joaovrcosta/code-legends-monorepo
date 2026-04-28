import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { LessonProductionStatus } from '@prisma/client'
import { makeUpsertLessonProductionUseCase } from '../../../utils/factories/make-upsert-lesson-production-use-case'

const paramsSchema = z.object({
  lessonId: z.coerce.number().int().positive(),
})

const bodySchema = z.object({
  status: z.nativeEnum(LessonProductionStatus),
  notes: z.string().trim().max(2000).optional(),
})

export async function patchLessonProduction(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsParsed = paramsSchema.safeParse(request.params ?? {})
    if (!paramsParsed.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: paramsParsed.error.format() })
    }
    const bodyParsed = bodySchema.safeParse(request.body ?? {})
    if (!bodyParsed.success) {
      return reply.status(400).send({ message: 'Invalid body', issues: bodyParsed.error.format() })
    }

    const lessonId = paramsParsed.data.lessonId
    const { status, notes } = bodyParsed.data

    const actorId = (request.user as { id: string } | undefined)?.id
    if (!actorId) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const useCase = makeUpsertLessonProductionUseCase()
    const row = await useCase.execute({
      lessonId,
      status,
      notes: notes ?? null,
      actorId,
    })

    return reply.status(200).send({
      item: {
        lessonId: row.lessonId,
        status: row.status,
        notes: row.notes ?? null,
        updatedAt: row.updatedAt,
        updatedById: row.updatedById,
      },
    })
  } catch (error) {
    request.log.error(error, 'patchLessonProduction error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

