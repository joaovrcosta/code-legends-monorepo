import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { AuthenticateGoogleUseCase } from "../../use-cases/entities/Account/authenticate-google";

export function makeAuthenticateGoogleUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const authenticateGoogleUseCase = new AuthenticateGoogleUseCase(usersRepository);

  return authenticateGoogleUseCase;
}
