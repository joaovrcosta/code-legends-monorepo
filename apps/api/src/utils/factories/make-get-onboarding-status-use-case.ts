import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { GetOnboardingStatusUseCase } from "../../use-cases/entities/Account/get-onboarding-status";

export function makeGetOnboardingStatusUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const getOnboardingStatusUseCase = new GetOnboardingStatusUseCase(
    usersRepository
  );

  return getOnboardingStatusUseCase;
}

