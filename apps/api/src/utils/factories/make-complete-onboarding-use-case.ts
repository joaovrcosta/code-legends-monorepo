import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CompleteOnboardingUseCase } from "../../use-cases/entities/Account/complete-onboarding";

export function makeCompleteOnboardingUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    usersRepository
  );

  return completeOnboardingUseCase;
}

