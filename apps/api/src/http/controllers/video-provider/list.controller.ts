import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListVideoProvidersUseCase } from '../../../utils/factories/make-video-provider-use-cases'

export async function listVideoProviders(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    includeDeprecated: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
  })
  const { includeDeprecated } = querySchema.parse(request.query)
  const useCase = makeListVideoProvidersUseCase()
  const providers = await useCase.execute({ includeDeprecated: includeDeprecated ?? true })
  return reply.send({ providers })
}
