import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { StartCourseUseCase } from "../../use-cases/entities/Course/start";

export function makeStartCourseUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const courseRepository = new PrismaCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const startCourseUseCase = new StartCourseUseCase(
    userCourseRepository,
    courseRepository,
    usersRepository
  );

  return startCourseUseCase;
}
