import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { ListRecentCoursesUseCase } from "../../use-cases/entities/Course/list-recent";

export function makeListRecentCoursesUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const listRecentCoursesUseCase = new ListRecentCoursesUseCase(
    courseRepository
  );

  return listRecentCoursesUseCase;
}
