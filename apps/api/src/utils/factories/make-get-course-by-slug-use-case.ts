import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { GetCourseBySlugUseCase } from "../../use-cases/entities/Course/get-by-slug";

export function makeGetCourseBySlugUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const getCourseBySlugUseCase = new GetCourseBySlugUseCase(courseRepository);

  return getCourseBySlugUseCase;
}
