import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetLessonProductionByCourseUseCase } from '../../../utils/factories/make-get-lesson-production-by-course-use-case'

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
    const useCase = makeGetLessonProductionByCourseUseCase()
    const items: LessonProductionItem[] = await useCase.execute(courseId)
    return reply.status(200).send({ items })
  } catch (error) {
    request.log.error(error, 'getLessonProductionByCourse error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

