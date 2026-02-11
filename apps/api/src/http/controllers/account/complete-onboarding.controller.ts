import { FastifyReply, FastifyRequest } from "fastify";
import { makeCompleteOnboardingUseCase } from "../../../utils/factories/make-complete-onboarding-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function completeOnboarding(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const completeOnboardingUseCase = makeCompleteOnboardingUseCase();

    const { user } = await completeOnboardingUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        onboardingCompleted: user.onboardingCompleted,
        onboardingGoal: user.onboardingGoal,
        onboardingCareer: user.onboardingCareer,
      },
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
