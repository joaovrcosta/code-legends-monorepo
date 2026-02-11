import { GetCourseProgressUseCase } from "../../use-cases/entities/Course/get-progress";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";

export function makeGetCourseProgressUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();

  const getCourseProgressUseCase = new GetCourseProgressUseCase(
    courseRepository,
    userCourseRepository,
    userProgressRepository
  );

  return getCourseProgressUseCase;
}

