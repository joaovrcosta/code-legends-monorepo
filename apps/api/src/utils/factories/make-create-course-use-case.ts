import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { CreateCourseUseCase } from "../../use-cases/entities/Course/create";

export function makeCreateCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const createCourseUseCase = new CreateCourseUseCase(
    courseRepository,
    usersRepository,
    categoryRepository
  );

  return createCourseUseCase;
}
