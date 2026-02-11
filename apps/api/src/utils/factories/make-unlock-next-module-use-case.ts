import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaUnlockedModuleRepository } from "../../repositories/prisma/prisma-unlocked-module-repository";
import { UnlockNextModuleUseCase } from "../../use-cases/entities/Module/unlock-next-module";

export function makeUnlockNextModuleUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const courseRepository = new PrismaCourseRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const unlockedModuleRepository = new PrismaUnlockedModuleRepository();

  const unlockNextModuleUseCase = new UnlockNextModuleUseCase(
    userCourseRepository,
    courseRepository,
    userProgressRepository,
    unlockedModuleRepository
  );

  return unlockNextModuleUseCase;
}

