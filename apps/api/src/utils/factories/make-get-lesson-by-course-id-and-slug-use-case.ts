import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { GetLessonByCourseIdAndSlugUseCase } from "../../use-cases/entities/Lesson/get-by-course-id-and-slug";

export function makeGetLessonByCourseIdAndSlugUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const userCourseRepository = new PrismaUserCourseRepository();
  const getLessonByCourseIdAndSlugUseCase = new GetLessonByCourseIdAndSlugUseCase(
    lessonRepository,
    userProgressRepository,
    userCourseRepository
  );

  return getLessonByCourseIdAndSlugUseCase;
}

