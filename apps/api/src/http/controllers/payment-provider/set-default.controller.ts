import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSetDefaultPaymentProviderUseCase } from '../../../utils/factories/make-payment-provider-use-cases'
import { PaymentProviderNotFoundError } from '../../../use-cases/errors/payment-provider-not-found'

export async function setDefaultPaymentProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().cuid() })

  try {
    const { id } = paramsSchema.parse(request.params)
    const useCase = makeSetDefaultPaymentProviderUseCase()
    const { provider } = await useCase.execute({
      id,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof PaymentProviderNotFoundError) {
      return reply.status(404).send({ message: e.message })
    }
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
