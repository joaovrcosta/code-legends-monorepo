import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { ListUsersUseCase } from "../../use-cases/entities/Account/list";

export function makeListUsersUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new ListUsersUseCase(userRepository);
}



