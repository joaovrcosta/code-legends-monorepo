import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaUnlockedModuleRepository } from "../../repositories/prisma/prisma-unlocked-module-repository";
import { ContinueToNextModuleUseCase } from "../../use-cases/entities/Module/continue-to-next-module";

export function makeContinueToNextModuleUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const courseRepository = new PrismaCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const unlockedModuleRepository = new PrismaUnlockedModuleRepository();

  const continueToNextModuleUseCase = new ContinueToNextModuleUseCase(
    userCourseRepository,
    courseRepository,
    userProgressRepository,
    unlockedModuleRepository
  );

  return continueToNextModuleUseCase;
}

