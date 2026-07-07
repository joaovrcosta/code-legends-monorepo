import { FastifyReply, FastifyRequest } from 'fastify'
import {
  getWebhookHandler,
  type PaymentProviderHandlerKey,
  WEBHOOK_SECRET_HEADER,
} from '@code-legends/payment-providers'
import { getPaymentProviderCredentials } from '../../../lib/payment-provider-credentials'
import { makeHandlePaymentPaidUseCase } from '../../../utils/factories/make-payment-provider-use-cases'

interface WebhookRequest extends FastifyRequest {
  rawBody?: string
}

export interface PaymentWebhookOptions {
  allowLegacyQuerySecret?: boolean
}

export async function handlePaymentWebhook(
  request: WebhookRequest,
  reply: FastifyReply,
  handlerKey: PaymentProviderHandlerKey,
  options?: PaymentWebhookOptions,
) {
  let handler
  try {
    handler = getWebhookHandler(handlerKey)
  } catch {
    return reply.status(404).send({ message: 'Unknown payment handler' })
  }

  let credentials
  try {
    credentials = getPaymentProviderCredentials(handlerKey)
  } catch {
    return reply.status(503).send({
      message: `Webhook not configured for handler ${handlerKey}`,
    })
  }

  const rawBody =
    request.rawBody ??
    (typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body ?? {}))

  const querySecret = (request.query as { webhookSecret?: string })
    ?.webhookSecret

  const verified = handler.verifyWebhook({
    rawBody,
    headers: request.headers as Record<string, string | string[] | undefined>,
    getWebhookSecret: credentials.getWebhookSecret,
    allowLegacyQuerySecret: options?.allowLegacyQuerySecret,
    querySecret,
  })

  if (!verified) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  if (
    options?.allowLegacyQuerySecret &&
    querySecret &&
    !request.headers[WEBHOOK_SECRET_HEADER.toLowerCase()]
  ) {
    request.log.warn(
      { handlerKey },
      'Payment webhook: query param webhookSecret is deprecated; use X-Webhook-Secret header',
    )
  }

  const event = handler.parseWebhook(request.body, { rawBody })
  if (!event) {
    return reply.status(200).send({ received: true })
  }

  try {
    const handlePaid = makeHandlePaymentPaidUseCase()

    if (event.type === 'paid') {
      const result = await handlePaid.execute({
        gatewayPaymentId: event.gatewayPaymentId,
        gateway: handler.gatewayCode,
      })

      if (!result.ok && result.reason === 'payment_not_found') {
        request.log.warn(
          { gatewayPaymentId: event.gatewayPaymentId, gateway: handler.gatewayCode },
          'Payment webhook: payment not found',
        )
      }
    } else if (event.type === 'failed') {
      // Future: mark payment as FAILED
    } else if (event.type === 'refunded') {
      // Future: mark payment as REFUNDED
    }

    return reply.status(200).send({ received: true })
  } catch (err) {
    request.log.error(err, 'Payment webhook processing error')
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function paymentWebhook(
  request: FastifyRequest<{ Params: { handlerKey: string } }>,
  reply: FastifyReply,
) {
  const handlerKey = request.params.handlerKey as PaymentProviderHandlerKey
  return handlePaymentWebhook(request, reply, handlerKey)
}

export async function abacatePayWebhook(
  request: FastifyRequest<{ Querystring: { webhookSecret?: string } }>,
  reply: FastifyReply,
) {
  return handlePaymentWebhook(request, reply, 'abacate', {
    allowLegacyQuerySecret: true,
  })
}
