import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { DeleteUserUseCase } from "../../use-cases/entities/Account/delete";

export function makeDeleteUserUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new DeleteUserUseCase(userRepository);
}



