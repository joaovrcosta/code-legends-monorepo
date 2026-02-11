import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { UpdateCurrentModuleUseCase } from "../../use-cases/entities/Module/update-current";

export function makeUpdateCurrentModuleUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const moduleRepository = new PrismaModuleRepository();
  const courseRepository = new PrismaCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();

  const updateCurrentModuleUseCase = new UpdateCurrentModuleUseCase(
    userCourseRepository,
    moduleRepository,
    courseRepository,
    userProgressRepository
  );

  return updateCurrentModuleUseCase;
}

