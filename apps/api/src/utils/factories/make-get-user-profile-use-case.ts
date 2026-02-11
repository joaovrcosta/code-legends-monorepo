import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { GetUserProfileUseCase } from "../../use-cases/entities/Account/get-user-profile";

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository);

  return getUserProfileUseCase;
}
