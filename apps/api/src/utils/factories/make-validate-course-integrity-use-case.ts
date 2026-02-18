import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { ValidateCourseIntegrityUseCase } from "../../use-cases/entities/Course/validate-course-integrity";

export function makeValidateCourseIntegrityUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const validateCourseIntegrityUseCase = new ValidateCourseIntegrityUseCase(
    courseRepository
  );

  return validateCourseIntegrityUseCase;
}
