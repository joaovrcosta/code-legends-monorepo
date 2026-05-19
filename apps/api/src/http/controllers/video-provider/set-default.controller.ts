import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSetDefaultVideoProviderUseCase } from '../../../utils/factories/make-video-provider-use-cases'
import { VideoProviderNotFoundError } from '../../../use-cases/errors/video-provider-not-found'

export async function setDefaultVideoProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().cuid() })

  try {
    const { id } = paramsSchema.parse(request.params)
    const useCase = makeSetDefaultVideoProviderUseCase()
    const { provider } = await useCase.execute({
      id,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof VideoProviderNotFoundError) {
      return reply.status(404).send({ message: e.message })
    }
    throw e
  }
}
