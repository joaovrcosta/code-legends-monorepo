import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { GetUserByIdUseCase } from "../../use-cases/entities/Account/get-by-id";

export function makeGetUserByIdUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new GetUserByIdUseCase(userRepository);
}



