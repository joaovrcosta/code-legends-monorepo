import { FastifyReply, FastifyRequest } from 'fastify'
import { makeListPaymentProvidersUseCase } from '../../../utils/factories/make-payment-provider-use-cases'

export async function listActivePaymentProviders(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeListPaymentProvidersUseCase()
  const providers = await useCase.execute({ activeOnly: true })
  return reply.send({ providers })
}
