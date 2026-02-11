import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { ListPopularCoursesUseCase } from "../../use-cases/entities/Course/list-popular";

export function makeListPopularCoursesUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const listPopularCoursesUseCase = new ListPopularCoursesUseCase(
    courseRepository
  );

  return listPopularCoursesUseCase;
}
