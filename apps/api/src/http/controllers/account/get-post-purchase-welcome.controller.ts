import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetPostPurchaseWelcomeUseCase } from "../../../utils/factories/make-get-post-purchase-welcome-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export type { PostPurchaseWelcomeKind } from "../../../use-cases/entities/Account/get-post-purchase-welcome";

export async function getPostPurchaseWelcome(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const useCase = makeGetPostPurchaseWelcomeUseCase();
    const body = await useCase.execute({ userId: request.user.id });
    return reply.status(200).send(body);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
