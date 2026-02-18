import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PublishCourseUseCase } from "../../use-cases/entities/Course/publish";
import { makeValidateCourseIntegrityUseCase } from "./make-validate-course-integrity-use-case";

export function makePublishCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const validateCourseIntegrityUseCase = makeValidateCourseIntegrityUseCase();
  const publishCourseUseCase = new PublishCourseUseCase(
    courseRepository,
    validateCourseIntegrityUseCase
  );

  return publishCourseUseCase;
}
