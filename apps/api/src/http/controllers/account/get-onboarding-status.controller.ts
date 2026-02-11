import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetOnboardingStatusUseCase } from "../../../utils/factories/make-get-onboarding-status-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function getOnboardingStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const getOnboardingStatusUseCase = makeGetOnboardingStatusUseCase();

    const status = await getOnboardingStatusUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send(status);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
