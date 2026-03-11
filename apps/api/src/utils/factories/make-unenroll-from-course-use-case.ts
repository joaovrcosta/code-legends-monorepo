import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { UnenrollFromCourseUseCase } from "../../use-cases/entities/Course/unenroll";

export function makeUnenrollFromCourseUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();

  const useCase = new UnenrollFromCourseUseCase(
    usersRepository,
    courseRepository,
    userCourseRepository
  );

  return useCase;
}

