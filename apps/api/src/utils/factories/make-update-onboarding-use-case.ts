import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { UpdateOnboardingUseCase } from "../../use-cases/entities/Account/update-onboarding";

export function makeUpdateOnboardingUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const updateOnboardingUseCase = new UpdateOnboardingUseCase(usersRepository);

  return updateOnboardingUseCase;
}

