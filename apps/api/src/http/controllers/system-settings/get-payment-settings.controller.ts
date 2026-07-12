import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetPaymentSettingsUseCase } from '../../../use-cases/factories/make-payment-settings-use-cases'

export async function getPaymentSettings(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeGetPaymentSettingsUseCase()
  const result = await useCase.execute()
  return reply.status(200).send(result)
}
