import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListLessonProductionLogsUseCase } from '../../../utils/factories/make-list-lesson-production-logs-use-case'

const querySchema = z.object({
  courseId: z.string().min(1),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().min(1).optional(),
})

export async function getLessonProductionLogsByCourse(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = querySchema.safeParse(request.query ?? {})
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid query', issues: parsed.error.format() })
    }

    const useCase = makeListLessonProductionLogsUseCase()
    const result = await useCase.execute({
      courseId: parsed.data.courseId,
      limit: parsed.data.limit ?? 50,
      cursor: parsed.data.cursor ?? null,
    })
    return reply.status(200).send(result)
  } catch (error) {
    request.log.error(error, 'getLessonProductionLogsByCourse error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

