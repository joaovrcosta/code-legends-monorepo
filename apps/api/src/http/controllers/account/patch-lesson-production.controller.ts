import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { LessonProductionStatus } from '@prisma/client'

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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    })
    if (!lesson) {
      return reply.status(404).send({ message: 'Lesson not found' })
    }

    const row = await prisma.lessonProduction.upsert({
      where: { lessonId },
      create: {
        lessonId,
        status,
        notes: notes ?? null,
        updatedById: actorId,
      },
      update: {
        status,
        notes: notes ?? null,
        updatedById: actorId,
      },
      select: {
        lessonId: true,
        status: true,
        notes: true,
        updatedAt: true,
        updatedById: true,
      },
    })

    return reply.status(200).send({
      item: {
        lessonId: row.lessonId,
        status: row.status,
        notes: row.notes ?? null,
        updatedAt: row.updatedAt.toISOString(),
        updatedById: row.updatedById,
      },
    })
  } catch (error) {
    request.log.error(error, 'patchLessonProduction error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

