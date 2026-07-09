import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCheckoutUseCase } from "../../../utils/factories/make-payment-provider-use-cases";
import type { CreateCheckoutResult } from "../../../use-cases/entities/Payment/create-checkout";
import { checkoutRejectionMessage } from "../../../use-cases/entities/Payment/checkout-rejection-messages";
import { PaymentProviderNotFoundError } from "../../../use-cases/errors/payment-provider-not-found";

const bodySchema = z.object({
  plan: z.string().min(1),
  returnUrl: z.string().url().optional(),
  completionUrl: z.string().url().optional(),
});

function mapCheckoutFailure(result: Extract<CreateCheckoutResult, { ok: false }>) {
  const message = checkoutRejectionMessage(result.reason);
  const clientErrors = new Set([
    'invalid_plan',
    'already_on_plan',
    'downgrade_not_allowed',
    'ambiguous_plan_tier',
    'subscription_ending_soon',
    'invalid_upgrade_amount',
  ]);
  const status = clientErrors.has(result.reason) ? 400 : result.reason === 'user_not_found' ? 404 : result.reason === 'api_not_configured' ? 503 : 500;
  return { status, message, reason: result.reason };
}

export async function createCheckout(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ message: "Invalid body", issues: parsed.error.format() });
  }

  const userId = (request.user as { id: string })?.id;
  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const baseUrl = request.headers.origin ?? "http://localhost:3000";
  const returnUrl = parsed.data.returnUrl ?? `${baseUrl}/cart/${parsed.data.plan}`;
  const completionUrl = parsed.data.completionUrl ?? `${baseUrl}/learn`;

  let result: CreateCheckoutResult;
  try {
    const useCase = makeCreateCheckoutUseCase();
    result = await useCase.execute({
      userId,
      planSlug: parsed.data.plan.toUpperCase(),
      returnUrl,
      completionUrl,
    });
  } catch (err) {
    request.log.error(err, "Create checkout use case threw");

    if (err instanceof PaymentProviderNotFoundError) {
      return reply.status(503).send({
        message:
          "Provedor de pagamento não configurado. Execute a migration e o seed de payment providers.",
      });
    }

    const message = err instanceof Error ? err.message : "Erro ao criar checkout";
    return reply.status(502).send({
      message: message.includes("Abacate")
        ? message
        : "Falha no gateway de pagamento. Tente novamente.",
    });
  }

  if (!result.ok) {
    const mapped = mapCheckoutFailure(result);
    return reply.status(mapped.status).send({
      message: mapped.message,
      reason: mapped.reason,
    });
  }

  if (!result.checkoutUrl) {
    return reply.status(502).send({
      message: "Gateway de pagamento não retornou URL de checkout",
    });
  }

  return reply.status(200).send({
    checkoutUrl: result.checkoutUrl,
    paymentId: result.paymentId,
  });
}
