import { FastifyReply, FastifyRequest } from 'fastify'
import { makeListVideoProvidersUseCase } from '../../../utils/factories/make-video-provider-use-cases'

export async function listActiveVideoProviders(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeListVideoProvidersUseCase()
  const providers = await useCase.execute({ activeOnly: true })
  return reply.send({ providers })
}
