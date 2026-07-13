import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaUserModuleProgressRepository } from "../../repositories/prisma/prisma-user-module-progress-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CompleteLessonUseCase } from "../../use-cases/entities/Lesson/complete";

export function makeCompleteLessonUseCase() {
  const userProgressRepository = new PrismaUserProgressRepository();
  const userModuleProgressRepository = new PrismaUserModuleProgressRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const completeLessonUseCase = new CompleteLessonUseCase(
    userProgressRepository,
    userModuleProgressRepository,
    userCourseRepository,
    usersRepository
  );

  return completeLessonUseCase;
}
