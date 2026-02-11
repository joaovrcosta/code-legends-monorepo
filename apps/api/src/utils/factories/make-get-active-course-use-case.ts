import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { GetActiveCourseUseCase } from "../../use-cases/entities/Course/get-active";

export function makeGetActiveCourseUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const getActiveCourseUseCase = new GetActiveCourseUseCase(
    usersRepository,
    courseRepository,
    userCourseRepository
  );

  return getActiveCourseUseCase;
}

