import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetCourseSkillsConfigUseCase } from '../../../utils/factories/make-get-course-skills-config-use-case'
import { CourseNotFoundError } from '../../../use-cases/errors/course-not-found'

async function handleGetSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
  opts: { allowUnpublished: boolean; mergeLessonSkills?: boolean },
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id: courseId } = paramsSchema.parse(request.params)

  try {
    const useCase = makeGetCourseSkillsConfigUseCase()
    const { skills } = await useCase.execute(courseId, {
      allowUnpublished: opts.allowUnpublished,
      mergeLessonSkills: opts.mergeLessonSkills,
    })
    return reply.status(200).send({ courseId, skills })
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    console.error('Erro ao buscar configuração de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

/** Público: apenas curso PUBLISHED; lista união curso + aulas (merge). */
export async function getSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handleGetSkillsConfig(request, reply, {
    allowUnpublished: false,
  })
}

/** Instructor/admin: rascunhos; só CourseSkill (sem merge com LessonSkill) para o editor. */
export async function getSkillsConfigEditor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handleGetSkillsConfig(request, reply, {
    allowUnpublished: true,
    mergeLessonSkills: false,
  })
}

