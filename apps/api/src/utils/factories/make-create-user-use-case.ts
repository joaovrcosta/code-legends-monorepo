import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CreateUserUseCase } from "../../use-cases/entities/Account/create";

export function makeCreateUserUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new CreateUserUseCase(userRepository);
}
