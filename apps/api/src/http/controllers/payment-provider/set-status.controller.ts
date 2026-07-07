import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSetPaymentProviderStatusUseCase } from '../../../utils/factories/make-payment-provider-use-cases'
import { CannotModifyBuiltinProviderError } from '../../../use-cases/errors/cannot-modify-builtin-provider'
import { PaymentProviderNotFoundError } from '../../../use-cases/errors/payment-provider-not-found'

export async function setPaymentProviderStatus(
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
    const useCase = makeSetPaymentProviderStatusUseCase()
    const { provider } = await useCase.execute({
      id,
      status,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof PaymentProviderNotFoundError) {
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
