import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetCourseSkillsConfigUseCase } from '../../../utils/factories/make-get-course-skills-config-use-case'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'

export async function getSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id: courseId } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetCourseSkillsConfigUseCase()
    const { skills } = await useCase.execute(courseId)
    return reply.status(200).send({ courseId, skills })
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    console.error('Erro ao buscar configuração de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

