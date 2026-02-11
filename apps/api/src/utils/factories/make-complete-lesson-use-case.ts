import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaUserModuleProgressRepository } from "../../repositories/prisma/prisma-user-module-progress-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CompleteLessonUseCase } from "../../use-cases/entities/Lesson/complete";

export function makeCompleteLessonUseCase() {
  const userProgressRepository = new PrismaUserProgressRepository();
  const userModuleProgressRepository = new PrismaUserModuleProgressRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const lessonRepository = new PrismaLessonRepository();
  const moduleRepository = new PrismaModuleRepository();
  const courseRepository = new PrismaCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const completeLessonUseCase = new CompleteLessonUseCase(
    userProgressRepository,
    userModuleProgressRepository,
    userCourseRepository,
    lessonRepository,
    moduleRepository,
    courseRepository,
    usersRepository
  );

  return completeLessonUseCase;
}
