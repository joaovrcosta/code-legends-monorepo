import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const querySchema = z.object({
  courseId: z.string().min(1),
})

export type LessonProductionItem = {
  lessonId: number
  status: string
  notes: string | null
  updatedAt: string
  updatedById: string
}

export async function getLessonProductionByCourse(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = querySchema.safeParse(request.query ?? {})
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid query', issues: parsed.error.format() })
    }

    const { courseId } = parsed.data

    const lessons = await prisma.lesson.findMany({
      where: { submodule: { module: { courseId } } },
      select: {
        id: true,
        production: {
          select: {
            status: true,
            notes: true,
            updatedAt: true,
            updatedById: true,
          },
        },
      },
    })

    const items: LessonProductionItem[] = lessons
      .filter((l) => l.production != null)
      .map((l) => ({
        lessonId: l.id,
        status: l.production!.status,
        notes: l.production!.notes ?? null,
        updatedAt: l.production!.updatedAt.toISOString(),
        updatedById: l.production!.updatedById,
      }))

    return reply.status(200).send({ items })
  } catch (error) {
    request.log.error(error, 'getLessonProductionByCourse error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

