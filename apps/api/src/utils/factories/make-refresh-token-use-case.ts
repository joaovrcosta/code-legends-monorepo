import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { RefreshTokenUseCase } from "../../use-cases/entities/Account/refresh-token";

export function makeRefreshTokenUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const refreshTokenUseCase = new RefreshTokenUseCase(usersRepository);

  return refreshTokenUseCase;
}
