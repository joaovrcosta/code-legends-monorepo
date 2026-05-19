import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateVideoProviderUseCase } from '../../../utils/factories/make-video-provider-use-cases'
import { ProviderSlugTakenError } from '../../../use-cases/errors/provider-slug-taken'

export async function createVideoProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    name: z.string().min(2).max(80),
    allowedDomains: z.array(z.string().min(1)).min(1),
    urlPlaceholder: z.string().max(500).optional(),
    helpText: z.string().max(1000).nullable().optional(),
  })

  try {
    const body = bodySchema.parse(request.body)
    const useCase = makeCreateVideoProviderUseCase()
    const { provider } = await useCase.execute({
      ...body,
      actorId: request.user.id,
    })
    return reply.status(201).send({ provider })
  } catch (e) {
    if (e instanceof ProviderSlugTakenError) {
      return reply.status(409).send({ message: e.message })
    }
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
