import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { UnpublishCourseUseCase } from "../../use-cases/entities/Course/unpublish";

export function makeUnpublishCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const unpublishCourseUseCase = new UnpublishCourseUseCase(courseRepository);

  return unpublishCourseUseCase;
}
