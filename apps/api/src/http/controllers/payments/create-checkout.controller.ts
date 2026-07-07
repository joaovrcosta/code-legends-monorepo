import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCheckoutUseCase } from "../../../utils/factories/make-payment-provider-use-cases";
import type { CreateCheckoutResult } from "../../../use-cases/entities/Payment/create-checkout";

const bodySchema = z.object({
  plan: z.enum(["pro", "premium"]),
  returnUrl: z.string().url().optional(),
  completionUrl: z.string().url().optional(),
});

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
      planSlug: parsed.data.plan,
      returnUrl,
      completionUrl,
    });
  } catch (err) {
    request.log.error(err, "Create checkout use case threw");
    const message = err instanceof Error ? err.message : "Erro ao criar checkout";
    return reply.status(502).send({
      message: message.includes("Abacate") ? message : "Falha no gateway de pagamento. Tente novamente.",
    });
  }

  if (!result.ok) {
    if (result.reason === "invalid_plan") {
      return reply.status(400).send({ message: "Plano inválido" });
    }
    if (result.reason === "api_not_configured") {
      return reply.status(503).send({ message: "Pagamento temporariamente indisponível" });
    }
    if (result.reason === "user_not_found") {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }
    return reply.status(500).send({ message: "Erro ao criar checkout" });
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
