import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserProfileUseCase } from "../../../utils/factories/make-get-user-profile-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getUserProfileUseCase = makeGetUserProfileUseCase();

    const { user } = await getUserProfileUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        onboardingCompleted: user.onboardingCompleted ?? false,
        onboardingGoal: user.onboardingGoal,
        onboardingCareer: user.onboardingCareer,
        googleId: (user as any).googleId || null,
        hasPassword: !!user.password,
        level: user.level ?? 1,
        totalXp: user.totalXp ?? 0,
        xpToNextLevel: user.xpToNextLevel ?? 100,
      },
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

