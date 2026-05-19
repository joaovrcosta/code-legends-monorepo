import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSetVideoProviderStatusUseCase } from '../../../utils/factories/make-video-provider-use-cases'
import { VideoProviderNotFoundError } from '../../../use-cases/errors/video-provider-not-found'

export async function setVideoProviderStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().cuid() })
  const bodySchema = z.object({
    status: z.enum(['ACTIVE', 'DEPRECATED', 'DISABLED']),
  })

  try {
    const { id } = paramsSchema.parse(request.params)
    const { status } = bodySchema.parse(request.body)
    const useCase = makeSetVideoProviderStatusUseCase()
    const { provider } = await useCase.execute({
      id,
      status,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof VideoProviderNotFoundError) {
      return reply.status(404).send({ message: e.message })
    }
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
