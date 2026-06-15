import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetCourseStructureEditorUseCase } from '../../../utils/factories/make-get-course-structure-editor-use-case'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'
import { sanitizeCourse } from '../../utils/sanitize'

export async function getStructureEditor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    courseId: z.string(),
  })

  const querySchema = z.object({
    includeContent: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value === 'true'),
  })

  const { courseId } = paramsSchema.parse(request.params)
  const { includeContent } = querySchema.parse(request.query ?? {})

  try {
    const useCase = makeGetCourseStructureEditorUseCase()
    const { course, modules } = await useCase.execute({
      courseId,
      includeContent,
    })

    return reply.status(200).send({
      course: sanitizeCourse(course),
      modules,
    })
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    request.log.error(error, 'getStructureEditor error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
