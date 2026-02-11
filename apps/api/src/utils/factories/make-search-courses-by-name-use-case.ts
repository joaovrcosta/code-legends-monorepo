import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { SearchCoursesByNameUseCase } from "../../use-cases/entities/Course/search-by-name";

export function makeSearchCoursesByNameUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const searchCoursesByNameUseCase = new SearchCoursesByNameUseCase(
    courseRepository,
    userCourseRepository
  );

  return searchCoursesByNameUseCase;
}

