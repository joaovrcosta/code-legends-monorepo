import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { ListInstructorsUseCase } from "../../use-cases/entities/Account/list-instructors";

export function makeListInstructorsUseCase() {
  const userRepository = new PrismaUsersRepository();

  return new ListInstructorsUseCase(userRepository);
}
