import { FastifyReply, FastifyRequest } from 'fastify'
import { makeBootstrapPaymentSettingsUseCase } from '../../../use-cases/factories/make-payment-settings-use-cases'

export async function bootstrapPaymentSettings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = (request.user as { id: string })?.id
  if (!userId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const useCase = makeBootstrapPaymentSettingsUseCase()
    const result = await useCase.execute({ actorId: userId })
    return reply.status(200).send(result)
  } catch (error) {
    request.log.error(error, 'Failed to bootstrap payment settings')
    return reply.status(500).send({
      message: 'Não foi possível garantir a configuração de pagamentos.',
    })
  }
}
