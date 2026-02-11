import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { AuthenticateUserUseCase } from "../../use-cases/entities/Account/auhenticate";

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);

  return authenticateUseCase;
}
