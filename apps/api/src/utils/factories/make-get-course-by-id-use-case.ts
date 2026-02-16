import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { GetCourseByIdUseCase } from "../../use-cases/entities/Course/get-by-id";

export function makeGetCourseByIdUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const getCourseByIdUseCase = new GetCourseByIdUseCase(courseRepository);

  return getCourseByIdUseCase;
}
