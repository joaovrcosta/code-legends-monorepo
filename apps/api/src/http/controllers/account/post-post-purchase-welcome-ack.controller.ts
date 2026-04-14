import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAckPostPurchaseWelcomeUseCase } from "../../../utils/factories/make-ack-post-purchase-welcome-use-case";
import { PaymentNotFoundError } from "../../../use-cases/errors/payment-not-found";
import { PaymentNotPaidError } from "../../../use-cases/errors/payment-not-paid";

const bodySchema = z.object({
  paymentId: z.string().min(1),
});

export async function postPostPurchaseWelcomeAck(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = bodySchema.parse(request.body);
    const useCase = makeAckPostPurchaseWelcomeUseCase();
    await useCase.execute({ userId: request.user.id, paymentId: body.paymentId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ message: "Invalid body", errors: error.errors });
    }
    if (error instanceof PaymentNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof PaymentNotPaidError) {
      return reply.status(400).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
