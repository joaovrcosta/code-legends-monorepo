import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { ResetProgressUseCase } from "../../use-cases/entities/Course/reset-progress";

export function makeResetProgressUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const courseRepository = new PrismaCourseRepository();

  const resetProgressUseCase = new ResetProgressUseCase(
    userCourseRepository,
    courseRepository
  );

  return resetProgressUseCase;
}




