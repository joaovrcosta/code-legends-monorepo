import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetLessonActivityUseCase } from '../../../utils/factories/make-get-lesson-activity-use-case'

const querySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional(),
})

export async function getLessonActivity(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.id
    const { days } = querySchema.parse(request.query ?? {})
    const useCase = makeGetLessonActivityUseCase()
    const result = await useCase.execute(userId, { days })
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro ao buscar atividade de aulas:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

