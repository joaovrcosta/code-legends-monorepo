import { FastifyReply, FastifyRequest } from "fastify";
import { createHash, timingSafeEqual } from "node:crypto";
import { makeHandleAbacateBillingPaidUseCase } from "../../../utils/factories/make-handle-abacate-billing-paid-use-case";
import { env } from "../../../env";

/**
 * Comparação em tempo constante (evita timing attacks e não vaza tamanho do secret).
 */
function secureCompare(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Valida o secret do webhook (query param webhookSecret).
 * Retorna true se válido.
 */
function validateWebhookSecret(provided: string | undefined): boolean {
  const secret = env.ABACATE_PAY_WEBHOOK_SECRET;
  if (!secret || secret.length === 0) return false;
  if (!provided || typeof provided !== "string") return false;
  return secureCompare(provided, secret);
}

interface AbacateWebhookPayload {
  id?: string;
  event?: string;
  data?: {
    billing?: { id?: string; status?: string };
    payment?: { amount?: number; method?: string };
  };
  devMode?: boolean;
}

export async function abacatePayWebhook(
  request: FastifyRequest<{
    Querystring: { webhookSecret?: string };
    Body: AbacateWebhookPayload;
  }>,
  reply: FastifyReply
) {
  if (!env.ABACATE_PAY_WEBHOOK_SECRET) {
    return reply.status(503).send({
      message: "Webhook not configured (ABACATE_PAY_WEBHOOK_SECRET)",
    });
  }

  const webhookSecret = request.query?.webhookSecret;
  if (!validateWebhookSecret(webhookSecret)) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const body = request.body as AbacateWebhookPayload | undefined;
  if (!body || typeof body !== "object") {
    return reply.status(400).send({ message: "Invalid payload" });
  }

  if (body.event !== "billing.paid") {
    return reply.status(200).send({ received: true });
  }

  const billingId = body.data?.billing?.id;
  if (!billingId || typeof billingId !== "string") {
    return reply.status(200).send({ received: true });
  }

  try {
    const useCase = makeHandleAbacateBillingPaidUseCase();
    const result = await useCase.execute({ billingId });

    if (!result.ok && result.reason === "payment_not_found") {
      request.log.warn(
        { billingId },
        "AbacatePay webhook: payment not found for billing id"
      );
    }

    return reply.status(200).send({ received: true });
  } catch (err) {
    request.log.error(err, "AbacatePay webhook processing error");
    return reply.status(500).send({ message: "Internal server error" });
  }
}
