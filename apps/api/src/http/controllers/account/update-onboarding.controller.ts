import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateOnboardingUseCase } from "../../../utils/factories/make-update-onboarding-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function updateOnboarding(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const updateOnboardingBodySchema = z.object({
    onboardingGoal: z.string().optional(),
    onboardingCareer: z.string().optional(),
  });

  try {
    const { onboardingGoal, onboardingCareer } =
      updateOnboardingBodySchema.parse(request.body);

    const updateOnboardingUseCase = makeUpdateOnboardingUseCase();

    const { user } = await updateOnboardingUseCase.execute({
      userId: request.user.id,
      onboardingGoal,
      onboardingCareer,
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

    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: error.errors });
    }

    console.error("Error updating onboarding:", error);
    return reply.status(500).send({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

