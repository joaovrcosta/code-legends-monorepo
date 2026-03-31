import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateCourseSkillsConfigUseCase } from '../../../utils/factories/make-update-course-skills-config-use-case'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'

export async function updateSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const bodySchema = z.object({
    skills: z
      .array(
        z.object({
          skillId: z.string().cuid(),
          weight: z.number().int().min(0).max(100),
        }),
      )
      .default([]),
  })

  const { id: courseId } = paramsSchema.parse(request.params)
  const { skills } = bodySchema.parse(request.body)

  try {
    const useCase = makeUpdateCourseSkillsConfigUseCase()
    const { skills: updated } = await useCase.execute({ courseId, skills })
    return reply.status(200).send({ courseId, skills: updated })
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    console.error('Erro ao atualizar configuração de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

