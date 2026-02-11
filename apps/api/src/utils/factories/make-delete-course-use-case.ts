import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { DeleteCourseUseCase } from "../../use-cases/entities/Course/delete";

export function makeDeleteCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const deleteCourseUseCase = new DeleteCourseUseCase(courseRepository);

  return deleteCourseUseCase;
}
