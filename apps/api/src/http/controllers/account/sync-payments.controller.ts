import { FastifyReply, FastifyRequest } from 'fastify'
import { makeSyncPaymentsUseCase } from '../../../utils/factories/make-payment-provider-use-cases'

/**
 * Sincroniza status dos pagamentos com os gateways remotos.
 * Só atualiza o banco; não retorna a lista (use GET /payments para listar).
 */
export async function syncPayments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeSyncPaymentsUseCase({
      warn: (message, meta) => request.log.warn(meta ?? {}, message),
    })
    const { updated } = await useCase.execute()

    return reply.status(200).send({
      ok: true,
      message: 'Sincronização concluída',
      updated,
    })
  } catch (error) {
    request.log.error(error, 'syncPayments error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
