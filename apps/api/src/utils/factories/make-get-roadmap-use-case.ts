import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { GetRoadmapUseCase } from "../../use-cases/entities/Course/get-roadmap";

export function makeGetRoadmapUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const getRoadmapUseCase = new GetRoadmapUseCase(
    courseRepository,
    userCourseRepository,
    userProgressRepository
  );

  return getRoadmapUseCase;
}
