import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { GetAccountOverviewUseCase } from "../../use-cases/entities/Account/get-account-overview";

export function makeGetAccountOverviewUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();

  return new GetAccountOverviewUseCase(
    usersRepository,
    userCourseRepository,
    userProgressRepository
  );
}
