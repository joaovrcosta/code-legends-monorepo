import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { ContinueCourseUseCase } from "../../use-cases/entities/Course/continue";

export function makeContinueCourseUseCase() {
  const courseRepository = new PrismaCourseRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const lessonRepository = new PrismaLessonRepository();
  const usersRepository = new PrismaUsersRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const continueCourseUseCase = new ContinueCourseUseCase(
    courseRepository,
    userCourseRepository,
    lessonRepository,
    usersRepository,
    userProgressRepository
  );

  return continueCourseUseCase;
}
