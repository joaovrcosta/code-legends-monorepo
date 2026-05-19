import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateVideoProviderUseCase } from '../../../utils/factories/make-video-provider-use-cases'
import { CannotModifyBuiltinProviderError } from '../../../use-cases/errors/cannot-modify-builtin-provider'
import { VideoProviderNotFoundError } from '../../../use-cases/errors/video-provider-not-found'

export async function updateVideoProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().cuid() })
  const bodySchema = z.object({
    name: z.string().min(2).max(80).optional(),
    allowedDomains: z.array(z.string().min(1)).min(1).optional(),
    urlPlaceholder: z.string().max(500).optional(),
    helpText: z.string().max(1000).nullable().optional(),
    sortOrder: z.number().int().optional(),
  })

  try {
    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)
    const useCase = makeUpdateVideoProviderUseCase()
    const { provider } = await useCase.execute({
      id,
      ...body,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof VideoProviderNotFoundError) {
      return reply.status(404).send({ message: e.message })
    }
    if (e instanceof CannotModifyBuiltinProviderError) {
      return reply.status(403).send({ message: e.message })
    }
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
