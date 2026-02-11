import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { ListCoursesUseCase } from "../../use-cases/entities/Course/list";

export function makeListCoursesUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const listCoursesUseCase = new ListCoursesUseCase(
    courseRepository,
    userCourseRepository,
    categoryRepository
  );

  return listCoursesUseCase;
}
