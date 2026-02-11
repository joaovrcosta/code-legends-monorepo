import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { UpdateCourseUseCase } from "../../use-cases/entities/Course/update";

export function makeUpdateCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const updateCourseUseCase = new UpdateCourseUseCase(
    courseRepository,
    categoryRepository
  );

  return updateCourseUseCase;
}
