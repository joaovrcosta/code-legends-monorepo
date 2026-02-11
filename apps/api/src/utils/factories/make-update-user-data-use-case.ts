import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { UpdateUserDataUseCase } from "../../use-cases/entities/Account/update-user-data";

export function makeUpdateUserDataUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new UpdateUserDataUseCase(userRepository);
}
