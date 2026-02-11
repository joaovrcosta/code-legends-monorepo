import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { EnrollCourseUseCase } from "../../use-cases/entities/Course/enroll";

export function makeEnrollCourseUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const courseRepository = new PrismaCourseRepository();
  const enrollCourseUseCase = new EnrollCourseUseCase(
    userCourseRepository,
    courseRepository
  );

  return enrollCourseUseCase;
}
