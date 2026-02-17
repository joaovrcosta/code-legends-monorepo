import { UnlinkGoogleUseCase } from "../../use-cases/entities/Account/unlink-google";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";

export function makeUnlinkGoogleUseCase() {
  const usersRepository = new PrismaUsersRepository();
  return new UnlinkGoogleUseCase(usersRepository);
}
